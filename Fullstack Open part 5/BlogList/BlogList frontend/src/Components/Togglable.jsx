import React, { useState, useImperativeHandle, forwardRef } from "react";

const Togglable = forwardRef(({ buttonLabel, children }, ref) => {
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  return (
    <div>
      {!visible && (
        <button onClick={show} style={{ marginBottom: 12 }}>
          {buttonLabel}
        </button>
      )}
      {visible && <div>{children(hide)}</div>}
    </div>
  );
});

export default Togglable;
