/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID, deleteTodo, getTodos, updateTodo } from './api/todos';
import { TodoHeader } from './components/TodoHeader';
import { TodoMain } from './components/TodoMain';
import { TodoFooter } from './components/TodoFooter';
// eslint-disable-next-line max-len
import { ErrorNotification } from './components/ErrorNotification/ErrorNotification';
import { Todo } from './types/Todo';
import { FilterOptions } from './types/FilterOptions';
import { ErrorMessage } from './types/ErrorMessage';

function filterTodos(todos: Todo[], option: FilterOptions) {
  if (option === FilterOptions.FilterByAllButton) {
    return todos;
  }

  return todos.filter(todo => Number(todo.completed) === option);
}

export const App: React.FC = () => {
  // #region States
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.NoErrors,
  );
  const [selectedOption, setSelectedOption] = useState<FilterOptions>(
    FilterOptions.FilterByAllButton,
  );
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isDataInProceeding, setIsDataInProceeding] = useState(false);
  const [selectedTodoIds, setSelectedTodoIds] = useState<number[]>([]);
  // #endregion

  const filteredTodos = filterTodos(todos, selectedOption);

  // #region creatingNewTodo
  const handleNewTodo = (newTodo: Todo) => {
    setTodos(currentTodos => {
      return [...currentTodos, newTodo];
    });
  };

  const handleSetTempTodo = (newTempTodo: Todo | null) => {
    setTempTodo(newTempTodo);
    if (newTempTodo) {
      setSelectedTodoIds(currSelectedTodoIds => [
        ...currSelectedTodoIds,
        newTempTodo.id,
      ]);
    }
  };
  // #endregion

  const handleFiltrationOption = (option: FilterOptions) => {
    setSelectedOption(option);
  };

  const handleSetDataLoadingStatus = (status: boolean) => {
    setIsDataInProceeding(status);
  };

  const handleError = (message: ErrorMessage) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(ErrorMessage.NoErrors);
    }, 3000);
  };

  // #region TodoDeletion
  const handleDeletionTodo = async (todoId: number) => {
    setIsDataInProceeding(true);
    setSelectedTodoIds(currSelectedTodoIds => [...currSelectedTodoIds, todoId]);

    try {
      await deleteTodo(todoId);
      setTodos(currentTodos => currentTodos.filter(todo => todo.id !== todoId));
    } catch (error) {
      handleError(ErrorMessage.OnDeletionTodo);
    } finally {
      setIsDataInProceeding(false);
      setSelectedTodoIds([]);
    }
  };

  const handleDeleteCompletedTodos = async () => {
    const completedTodos = todos.filter(todo => todo.completed === true);

    await Promise.allSettled(
      completedTodos.map(completedTodo => handleDeletionTodo(completedTodo.id)),
    );
  };
  // #endregion

  // #region UpdatingTodos
  const handleChangeTodo = async (todoToUpdate: Todo) => {
    setIsDataInProceeding(true);
    setSelectedTodoIds(currSelectedTodoIds => [
      ...currSelectedTodoIds,
      todoToUpdate.id,
    ]);

    try {
      const updatedTodo = await updateTodo(todoToUpdate);

      setTodos(currentTodos => {
        const newTodos = [...currentTodos];
        const indexOfTodoToUpdate = currentTodos.findIndex(
          todo => todo.id === todoToUpdate.id,
        );

        newTodos.splice(indexOfTodoToUpdate, 1, updatedTodo);

        return newTodos;
      });
    } catch {
      setErrorMessage(ErrorMessage.OnUpdatingTodo);
    } finally {
      setIsDataInProceeding(false);
      setSelectedTodoIds([]);
    }
  };

  // #region TodoStatusTogglers
  const handleToggleTodoStatus = (todoId: number) => {
    const todoWithStatusToUpdate = {
      ...(todos.find(todo => todo.id === todoId) as Todo),
    };

    todoWithStatusToUpdate.completed = !todoWithStatusToUpdate.completed;

    handleChangeTodo(todoWithStatusToUpdate);
  };

  const handleToggleAllTodosStatuses = async () => {
    if (todos.some(todo => todo.completed === false)) {
      const uncompletedTodos = todos.filter(todo => todo.completed === false);

      await Promise.allSettled(
        uncompletedTodos.map(uncompletedTodo =>
          handleToggleTodoStatus(uncompletedTodo.id),
        ),
      );
    } else {
      await Promise.allSettled(
        todos.map(todo => handleToggleTodoStatus(todo.id)),
      );
    }
  };
  // #endregion
  // #endregion

  useEffect(() => {
    console.log('isDataInProceeding: ', isDataInProceeding); // for testing
  }, [isDataInProceeding]);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        handleError(ErrorMessage.OnLoadingTodos);
      });
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader
          todos={todos}
          toggleAllTodoStatuses={handleToggleAllTodosStatuses}
          handleSetDataLoadingStatus={handleSetDataLoadingStatus}
          isDataInProceeding={isDataInProceeding}
          addTempTodo={handleSetTempTodo}
          updateTodoList={handleNewTodo}
          onError={handleError}
        />

        <TodoMain
          todos={filteredTodos}
          onDelete={handleDeletionTodo}
          selectedTodoIds={selectedTodoIds}
          tempTodo={tempTodo}
          isDataInProceeding={isDataInProceeding}
          toggleStatus={handleToggleTodoStatus}
        />

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <TodoFooter
            todos={todos}
            selectedOption={selectedOption}
            deleteCompletedTodos={handleDeleteCompletedTodos}
            selectOption={handleFiltrationOption}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorNotification
        errorMessage={errorMessage}
        onClose={setErrorMessage}
      />
    </div>
  );
};
