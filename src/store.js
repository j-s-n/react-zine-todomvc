import {publish, subscribe, issue} from 'react-zine';

export default class Store {
  constructor () {
    Object.assign(this, deriveRouteFromHash()); // Initialize route information
    this.nextID = 0; // Set the initial ID # to zero
    this.todos = deriveTodos((JSON.parse(localStorage.getItem('todos-react+zine')) || []).map(this.createTodo)); // Get todos from localstorage
    subscribe(this.todos, this.updateLocalStorage); // Update local storage whenever we update the list of todos
    subscribe(this.todos, () => publish(this)); // Publish the store whenever the list of todos updates
    window.addEventListener('hashchange', () => issue(this, deriveRouteFromHash())); // Update the store with new route information if the hash changes
  }

  createTodo = (todo) => {
    if (todo.id >= this.nextID) { // Increment nextID (ids loaded from localStorage may not start at 0)
      this.nextID = todo.id + 1;
    }

    // Create some actions for the todo
    todo.actions = {
      edit: () => issue(todo, {editing: true}),
      destroy: () => this.destroy(todo),
      toggle: () => {
        todo.completed = !todo.completed;
        this.updateTodos(this.todos.all);
      },
      handleInput: (event) => {
        const title = event.target.value.trim();
        if (event.which == ENTER_KEY || event.which === undefined) { // Submit changes
          if (!title) {
            this.destroy(todo);
          } else {
            issue(todo, {title, editing: false});
          }
        } else if (event.which == ESCAPE_KEY) {
          issue(todo, {editing: false});
        }
      }
    };

    subscribe(todo, this.updateLocalStorage); // Update local storage whenever the todo is updated
    // Note that we never explicitly unsubscribe, but there's no memory leak
    // zine's use of WeakMap ensures that dropped todos get garbage collected along with their subscription lists
    return todo;
  }

  updateLocalStorage = () => localStorage.setItem('todos-react+zine', JSON.stringify(this.todos.all.map(serialize)))

  updateTodos = (all) => issue(this.todos, deriveTodos(all))

  add = (title) => this.updateTodos([...this.todos.all, this.createTodo({id: this.nextID, completed: false, title})])

  destroy = (toDelete) => this.updateTodos(this.todos.all.filter((todo) => todo != toDelete))

  actions = {
    clearCompleted: () => this.updateTodos(this.todos.all.filter(notCompleted)),
    toggleAll: () => {
      let todos = this.todos;
      let state = todos.completed.length < todos.all.length;
      todos.all.forEach((todo) => {todo.completed = state;}); // For efficiency, we're mutating the todo objects without publishing them individually
      this.updateTodos(this.todos.all);
    },
    handleHeaderInput: (event) => {
      let value = event.target.value.trim();
      if (event.which == ENTER_KEY && value) { // On enter, actually create the new todo
        this.add(value);
        event.target.value = '';
      }
    }
  }
};

// Utility functions
const serialize = ({id, title, completed}) => ({id, title, completed}); // Ignore 'editing' status when serializing
const completed = (todo) => todo.completed; // A filter for completed todos
const notCompleted = (todo) => !completed(todo); // A filter for active todos
const deriveTodos = (all) => ({all, active: all.filter(notCompleted), completed: all.filter(completed)}); // Derive the active and completed categories from the list of all todos
const deriveRouteFromHash = () => { // Get route information from the URL
  const hash = window.location.hash;
  if (hash === '#/active') {
    return {hash, route: 'active'};
  } else if (hash === '#/completed') {
    return {hash, route: 'completed'};
  } else {
    return {hash: '#/', route: 'all'};
  }
};
