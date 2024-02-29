import React, { useState, useEffect } from "react";
import { useClientContext } from './clientState.js';
import { Cell } from './StyledComponents.js';

export const Stopwatch = ({index}) => {
  // state to store time
    const [time, setTime] = useState(0);
    const { state} = useClientContext();

  useEffect(() => {
    let intervalId;
    if (!state.students[index].inClass) {
      // setting time from 0 to 1 every second using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 1000);
      }
    else setTime(0)
    return () => { clearInterval(intervalId) };
  }, [state.students[index].inClass, time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time / 60)%60);
  const seconds = time %60;

    if (!state.students[index].inClass) {
        return (
            <Cell color='#AB2328'>
                {hours}:{minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
            </Cell>
        );
    }
    else return <Cell>In Class</Cell>
};