import { Link } from "react-router-dom";

const AnecdoteList = ({ anecdotes }) => (
  <div className="anecdote-list">
    <h2>Anecdotes</h2>
    <ul className="anecdote-list-ul">
      {anecdotes.map((anecdote) => (
        <li className="anecdote-list-item" key={anecdote.id}>
          <Link className="anecdote-link" to={`/anecdotes/${anecdote.id}`}>
            <strong>{anecdote.content}</strong>
          </Link>{" "}
          <br />
          <em>by {anecdote.author}</em> <br />
          <a href={anecdote.info} target="_blank" rel="noopener noreferrer">
            more info
          </a>{" "}
          <br />
          votes: {anecdote.votes}
        </li>
      ))}
    </ul>
  </div>
);

export default AnecdoteList;
