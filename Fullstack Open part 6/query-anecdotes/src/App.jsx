import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNotificationDispatch } from "./components/NotificationContext";
import AnecdoteForm from "./components/AnecdoteForm";
import Notification from "./components/Notification";

const fetchAnecdotes = async () => {
  const response = await axios.get("http://localhost:3001/anecdotes");
  return response.data;
};

const App = () => {
  const queryClient = useQueryClient();
  const dispatchNotification = useNotificationDispatch();
  const {
    data: anecdotes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["anecdotes"],
    queryFn: fetchAnecdotes,
  });

  const voteAnecdoteMutation = useMutation({
    mutationFn: async (anecdote) => {
      const updatedAnecdote = { ...anecdote, votes: anecdote.votes + 1 };
      const response = await axios.put(
        `http://localhost:3001/anecdotes/${anecdote.id}`,
        updatedAnecdote
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["anecdotes"] });
      dispatchNotification({
        type: "SHOW",
        payload: `you voted '${variables.content}'`,
      });
      setTimeout(() => {
        dispatchNotification({ type: "HIDE" });
      }, 5000);
    },
  });

  const handleVote = (anecdote) => {
    voteAnecdoteMutation.mutate(anecdote);
  };

  if (isLoading) {
    return <div>loading data...</div>;
  }

  if (isError) {
    return (
      <div>
        anecdote service not available due to problems in server communication
      </div>
    );
  }

  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />
      <AnecdoteForm />

      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
