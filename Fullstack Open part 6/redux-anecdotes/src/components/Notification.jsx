import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const Notification = () => {
  const notification = useSelector((state) => state.notification);
  const [visible, setVisible] = useState(!!notification);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification]);

  if (!visible || !notification) return null;

  const style = {
    border: "solid",
    padding: 10,
    borderWidth: 1,
  };
  return <div style={style}>{notification}</div>;
};

export default Notification;
