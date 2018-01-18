import React from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';
import {connect, Connector} from 'react-zine';

import Store from 'store';

// Presentational component for an individual todo
const renderTodo = ({title, completed, editing, actions: {toggle, edit, destroy, handleInput}}) => (
  <li className={cn({completed, editing})}>
    <div className="view">
      <input className="toggle" type="checkbox" checked={completed} onChange={toggle} />
      <label onDoubleClick={edit}>{title}</label>
      <button className="destroy" onClick={destroy} />
    </div>
    {editing && <input className="edit" type="text" autoFocus="true" defaultValue={title} onKeyDown={handleInput} onBlur={handleInput} />}
  </li>
);

// Container component for an individual todo: connects the todo argument to the renderer function
const renderConnectedTodo = (todo) => <Connector source={todo} render={renderTodo} key={todo.id} />;

// Presentational component for the main view
const renderTodoApp = ({todos, route, hash, actions: {toggleAll, clearCompleted, handleHeaderInput}}) => {
  let remaining = todos.all.length - todos.completed.length;
  let displayItems = todos.all.length > 0 ? 'block' : 'none';

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input className="new-todo" type="text" autoFocus="true" placeholder="What needs to be done?" onKeyDown={handleHeaderInput} />
      </header>
      <section className="main" style={{display: displayItems}}>
        <input className="toggle-all" type="checkbox" checked={!todos.active.length} onChange={toggleAll} />
        <ul className="todo-list">
          {todos[route].map(renderConnectedTodo)}
        </ul>
      </section>
      <footer className="footer" style={{display: displayItems}}>
        <span className="todo-count"><strong>{remaining}</strong> item{remaining != 1 ? 's' : ''} left</span>
        <ul className="filters">
          <li><a href={'#/'} className={cn({selected: hash == '#/'})}>All</a></li>
          <li><a href={'#/active'} className={cn({selected: hash == '#/active'})}>Active</a></li>
          <li><a href={'#/completed'} className={cn({selected: hash == '#/completed'})}>Completed</a></li>
        </ul>
        <button className="clear-completed" style={{display: todos.completed.length ? 'block' : 'none'}} onClick={clearCompleted}>Clear completed</button>
      </footer>
    </section>
  );
};

// What we actually render is a container that connects a store instance to the render function
ReactDOM.render(<Connector source={new Store()} render={renderTodoApp} />, document.getElementById('root'));
