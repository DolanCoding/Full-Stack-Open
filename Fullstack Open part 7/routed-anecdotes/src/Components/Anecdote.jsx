import { useParams } from "react-router-dom";

const Anecdote = ({ anecdotes }) => {
  const { id } = useParams();
  const anecdote = anecdotes.find((a) => a.id === Number(id));
  if (!anecdote) return <div>Anecdote not found</div>;
  return (
    <div className="anecdote-detail">
      <h2>{anecdote.content}</h2>
      <div>by {anecdote.author}</div>
      <div>has {anecdote.votes} votes</div>
      <div>
        for more info see{" "}
        <a href={anecdote.info} target="_blank" rel="noopener noreferrer">
          {anecdote.info}
        </a>
      </div>
    </div>
  );
};

export default Anecdote;
