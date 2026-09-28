import React, { useEffect } from "react";
import Mainroutes from "./routes/Mainroutes";
import { useDispatch } from "react-redux";
import { asyncLoadCurrentUser } from "./store/actions/userAction";
import { asyncLoadPresets } from "./store/actions/contextAction";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(asyncLoadCurrentUser());
    dispatch(asyncLoadPresets());
  }, [dispatch]);

  return (
    <div>
      <Mainroutes />
    </div>
  );
};

export default App;
