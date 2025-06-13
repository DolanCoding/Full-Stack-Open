import axios from "axios";
import { createSlice } from "@reduxjs/toolkit";
const getId = () => (100000 * Math.random()).toFixed(0);

const anecdoteSlice = createSlice({
  name: "anecdotes",
  initialState: [], // Start with empty array, will be set by setAnecdotes
  reducers: {
    voteAnecdote(state, action) {
      const id = action.payload;
      return state.map((anecdote) =>
        anecdote.id === id
          ? { ...anecdote, votes: anecdote.votes + 1 }
          : anecdote
      );
    },
    createAnecdote(state, action) {
      const content = action.payload;
      state.push({ content, id: getId(), votes: 0 });
    },
    setAnecdotes(state, action) {
      console.log("Setting anecdotes:", action.payload);
      return action.payload;
    },
  },
});

export const voteAnecdote = (id) => async (dispatch, getState) => {
  const anecdoteToVote = getState().anecdotes.find((a) => a.id === id);
  const updatedAnecdote = {
    ...anecdoteToVote,
    votes: anecdoteToVote.votes + 1,
  };
  await axios.put(`http://localhost:3001/anecdotes/${id}`, updatedAnecdote);
  dispatch(anecdoteSlice.actions.voteAnecdote(id));
};

export const createAnecdote = (content) => async (dispatch) => {
  const response = await axios.post("http://localhost:3001/anecdotes", {
    content,
    votes: 0,
  });
  dispatch(anecdoteSlice.actions.createAnecdote(response.data));
};

export const initializeAnecdotes = () => async (dispatch) => {
  const response = await axios.get("http://localhost:3001/anecdotes");
  console.log("Fetched anecdotes:", response.data);
  dispatch(anecdoteSlice.actions.setAnecdotes(response.data));
};

export default anecdoteSlice.reducer;
