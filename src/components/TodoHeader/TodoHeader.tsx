import { FormEvent, useEffect, useRef, useState } from 'react';
import { USER_ID, createNewTodo } from '../../api/todos';
import { Todo } from '../../types/Todo';
import classNames from 'classnames';
import { ErrorMessage } from '../../types/ErrorMessage';

type Props = {
  todos: Todo[];
  isDataInProceeding: boolean;
  isTodoTitleEditing: boolean;
  toggleAllTodoStatuses: () => void;
  handleSetDataLoadingStatus: (status: boolean) => void;
  addTempTodo: (tempTodo: Todo | null) => void;
  updateTodoList: (newTodo: Todo) => void;
  onError: (message: ErrorMessage) => void;
};

export const TodoHeader: React.FC<Props> = ({
  todos,
  isDataInProceeding,
  isTodoTitleEditing,
  toggleAllTodoStatuses,
  handleSetDataLoadingStatus,
  addTempTodo,
  updateTodoList,
  onError,
}) => {
  const [titleTodo, setTitleTodo] = useState<string>('');
  const focusOnInput = useRef<HTMLInputElement>(null);
  const isTodosEmpty = todos.length === 0;

  const handleFormInput = (event: FormEvent<HTMLInputElement>) => {
    setTitleTodo(event.currentTarget.value);
  };

  const handleCreateNewTodo = ({
    userId,
    title,
    completed,
  }: Omit<Todo, 'id'>) => {
    createNewTodo({ userId, title, completed })
      .then(newTodo => {
        updateTodoList(newTodo);
        setTitleTodo('');
      })
      .catch(() => {
        onError(ErrorMessage.OnAddingTodo);
        setTitleTodo(title.trim());
        addTempTodo(null);
      })
      .finally(() => {
        addTempTodo(null);
        handleSetDataLoadingStatus(false);
      });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (titleTodo.trim().length < 1) {
      onError(ErrorMessage.OnTitleLength);

      return;
    }

    handleSetDataLoadingStatus(true);
    addTempTodo({
      id: 0,
      userId: USER_ID,
      title: titleTodo.trim(),
      completed: false,
    });
    handleCreateNewTodo({
      userId: USER_ID,
      title: titleTodo.trim(),
      completed: false,
    });
  };

  useEffect(() => {
    if (!isTodoTitleEditing) {
      focusOnInput.current?.focus();
    }
  });

  return (
    <header className="todoapp__header">
      {!isTodosEmpty && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active:
              todos.every(todo => todo.completed === true) && !isTodosEmpty,
          })}
          data-cy="ToggleAllButton"
          onClick={() => {
            if (!isTodoTitleEditing) {
              toggleAllTodoStatuses();
            }
          }}
        />
      )}

      {/* Add a todo on form submit */}
      <form onSubmit={onSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          ref={focusOnInput}
          value={titleTodo}
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          disabled={isDataInProceeding}
          onChange={handleFormInput}
        />
      </form>
    </header>
  );
};
