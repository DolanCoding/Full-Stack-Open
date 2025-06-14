import { useNavigate } from "react-router-dom";
import { useField } from "../hooks";

const CreateNew = (props) => {
  const content = useField("text");
  const author = useField("text");
  const info = useField("text");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    props.addNew({
      content: content.value,
      author: author.value,
      info: info.value,
      votes: 0,
    });
    navigate("/");
  };

  const handleReset = (e) => {
    e.preventDefault();
    content.reset();
    author.reset();
    info.reset();
  };

  return (
    <div className="create-new-form">
      <h2>Create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          content
          <input {...content} name="content" />
        </div>
        <div className="form-group">
          author
          <input {...author} name="author" />
        </div>
        <div className="form-group">
          url for more info
          <input {...info} name="info" />
        </div>
        <button className="submit-btn">create</button>
        <button type="button" onClick={handleReset}>
          reset
        </button>
      </form>
    </div>
  );
};

export default CreateNew;
