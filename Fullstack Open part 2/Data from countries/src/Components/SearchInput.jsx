// Search input field component
function SearchInput({ value, onChange }) {
  return (
    <div>
      Find countries: <input value={value} onChange={onChange} />
    </div>
  );
}

export default SearchInput;
