import React, { useState, useImperativeHandle, forwardRef } from "react";

const Togglable = forwardRef(
  ({ buttonLabel, buttonClassName, children }, ref) => {
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
          <button onClick={show} className={buttonClassName}>
            {buttonLabel}
          </button>
        )}
        {visible && <div className="togglable-content">{children(hide)}</div>}
      </div>
    );
  }
);

export default Togglable;
