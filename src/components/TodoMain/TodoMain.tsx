/* eslint-disable jsx-a11y/label-has-associated-control */

import { Todo } from '../../types/Todo';
import { TodoItem } from './TodoItem';

/* eslint-disable jsx-a11y/control-has-associated-label */
type Props = {
  todos: Todo[];
  tempTodo: Todo | null;
  isDataInProceeding: boolean;
  selectedTodoIds: number[];
  onDelete: (todoId: number) => void;
  toggleStatus: (todoId: number) => void;
};

export const TodoMain: React.FC<Props> = ({
  todos,
  tempTodo,
  isDataInProceeding,
  selectedTodoIds,
  onDelete,
  toggleStatus,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {[...todos, tempTodo].map(todo => {
        if (todo !== null) {
          return (
            <TodoItem
              todo={todo}
              isDataInProceeding={isDataInProceeding}
              selectedTodoId={selectedTodoIds?.find(id => id === todo.id)}
              onDelete={onDelete}
              toggleStatus={toggleStatus}
              key={todo.id}
            />
          );
        } else {
          return;
        }
      })}
    </section>
  );
};
