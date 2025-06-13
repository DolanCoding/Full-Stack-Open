import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNotificationDispatch } from "./NotificationContext";

const addAnecdote = async (anecdote) => {
  const response = await axios.post(
    "http://localhost:3001/anecdotes",
    anecdote
  );
  return response.data;
};

const AnecdoteForm = () => {
  const queryClient = useQueryClient();
  const dispatchNotification = useNotificationDispatch();
  const newAnecdoteMutation = useMutation({
    mutationFn: addAnecdote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anecdotes"] });
    },
    onError: (error) => {
      dispatchNotification({
        type: "SHOW",
        payload: "anecdote content must be at least 5 characters",
      });
      setTimeout(() => {
        dispatchNotification({ type: "HIDE" });
      }, 5000);
    },
  });

  const onCreate = (event) => {
    event.preventDefault();
    const content = event.target[0].value;
    newAnecdoteMutation.mutate({ content, votes: 0 });
    event.target[0].value = "";
  };

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  );
};

export default AnecdoteForm;
