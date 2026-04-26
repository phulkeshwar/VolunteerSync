import { useDeferredValue, useState } from 'react';
import TaskCard from './TaskCard';

const STATUSES = ['Open', 'Assigned', 'In Progress', 'Completed'];

export default function TaskBoard(props) {
  const {
    tasks,
    currentUser,
    busyTaskId,
    onRunMatch,
    onAssign,
    onStatusChange,
    onDelete,
  } = props;

  const [filters, setFilters] = useState({
    status: 'All',
    urgency: 'All',
    city: 'All',
  });

  const deferredTasks = useDeferredValue(tasks);
  const cities = Array.from(new Set(tasks.map((task) => task.city).filter(Boolean))).sort();

  const filteredTasks = deferredTasks.filter((task) => {
    if (filters.status !== 'All' && task.status !== filters.status) return false;
    if (filters.urgency !== 'All' && task.urgency !== filters.urgency) return false;
    if (filters.city !== 'All' && task.city !== filters.city) return false;
    return true;
  });

  return (
    <section className="task-board">
      <div className="filters">
        <label>
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option>All</option>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Urgency</span>
          <select
            value={filters.urgency}
            onChange={(event) => setFilters((current) => ({ ...current, urgency: event.target.value }))}
          >
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>Critical</option>
          </select>
        </label>

        <label>
          <span>City</span>
          <select
            value={filters.city}
            onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
          >
            <option>All</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="kanban">
        {STATUSES.map((status) => {
          const columnTasks = filteredTasks.filter((task) => task.status === status);

          return (
            <div key={status} className="kanban-column">
              <div className="kanban-column__head">
                <h3>{status}</h3>
                <span>{columnTasks.length}</span>
              </div>

              <div className="kanban-column__body">
                {columnTasks.length ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUser={currentUser}
                      busyTaskId={busyTaskId}
                      onRunMatch={onRunMatch}
                      onAssign={onAssign}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                    />
                  ))
                ) : (
                  <div className="empty-inline">
                    <p>No tasks in this lane yet.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
