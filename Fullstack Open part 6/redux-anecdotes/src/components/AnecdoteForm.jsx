import { useDispatch } from "react-redux";
import { createAnecdote } from "../reducers/anecdoteReducer";
import { setNotification } from "../reducers/notificationReducer";

const AnecdoteForm = () => {
  const dispatch = useDispatch();

  const handleSubmit = (event) => {
    event.preventDefault();
    const content = event.target[0].value;
    dispatch(createAnecdote(content));
    dispatch(setNotification(`you created '${content}'`, 5));
    event.target[0].value = "";
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input />
      </div>
      <button>create</button>
    </form>
  );
};

export default AnecdoteForm;
