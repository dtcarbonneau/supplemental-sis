import styled from 'styled-components';
import { Transition } from 'react-transition-group';

import { Cell, ReportStyle, RepCell } from './StyledComponents';
import { arc } from 'd3';
import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMhsClass } from './contexts/globalContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import DatePicker from "react-datepicker";
import { scaleBand, scaleLinear } from 'd3';



// const Portal = ({ children }) => {
//   // This implimentation adds a child and does not use useref.
//   // const mount = document.getElementById("portal");
//   // const el = document.createElement("div");

//   // useEffect(() => {
//   //   mount.appendChild(el);
//   //   return () => mount.removeChild(el);
//   // }, [el, mount]);

//   // return createPortal(children, el)

//   const ref = useRef(null)
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     ref.current = document.querySelector("#portal")
//     setMounted(true)
//     //console.log(ref.current)
//   }, [])

//   //console.log(ref.current)
//   //return (mounted && ref.current) ? createPortal(<div> {children}</div>, ref.current):null
//   return createPortal(<div>{children}</div>, document.body)
// }
export default function AttendanceViz() {
  const { state, dispatch } = useMhsClass();
  //545176888048

  var timeArc = arc()
    .innerRadius(98)
    .outerRadius(100)
    .startAngle(1)
    .endAngle(4)

//MODAL STUFF
//Create Div Wrapper and add to DOM
function createWrapperAndAppendToBody(wrapperId) {
  const wrapperElement = document.createElement('div');
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

//Create Portal and Attach to Wrapper
function ReactPortal({ children, wrapperId = "react-portal-wrapper" }) {
  const [wrapperElement, setWrapperElement] = useState(null);

  useLayoutEffect(() => {
    let element = document.getElementById(wrapperId);
    let systemCreated = false;
    // if element is not found with wrapperId or wrapperId is not provided,
    // create and append to body
    if (!element) {
      systemCreated = true;
      element = createWrapperAndAppendToBody(wrapperId);
    }
    setWrapperElement(element);

    return () => {
      // delete the programatically created element
      if (systemCreated && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  }, [wrapperId]);

  // wrapperElement state will be null on the very first render.
  if (wrapperElement === null) return null;

  return createPortal(children, wrapperElement);
  }

function Modal({ children, modalOpen, handleClose }) {

  const StyledModal = styled.div`
    position: fixed;
    inset: 0; /* inset sets all 4 values (top right bottom left) much like how we set padding, margin etc., */
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-in-out;
    overflow: hidden;
    z-index: 999;
    padding: 40px 20px 20px;
    `;

  const StyledModalContent = styled.div`
    width: 70%;
    height: 70%;
    background-color: #282c34;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    `

  useEffect(() => {
    const closeOnEscapeKey = e => e.key === "Escape" ? handleClose() : null;
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, [handleClose]);

  if (!modalOpen) return null;

  return (
    <ReactPortal>
      <StyledModal>
        <button onClick={handleClose} className="close-btn">
          Close
        </button>
        <StyledModalContent>{children}</StyledModalContent>
      </StyledModal>
    </ReactPortal>
  );
};

  // function handleModal(e) {
  //   const [coords, setCoords] = useState({}); // takes current button coordinates
  //   const [isOn, setOn] = useState(false); // toggles button visibility

  //   const rect = e.target.getBoundingClientRect();
  //       setCoords({
  //         left: rect.x + rect.width / 2,
  //         top: rect.y + window.scrollY
  //       });
  //         setOn(!isOn); // [ 3 ]
  //       }}
  //     >
  //       Click me
  //     </Button>
  //     {
  //       isOn &&
  //       <Portal>
  //         <TooltipPopover coords={coords}>
  //           <div>Awesome content that is never cut off by its parent container!</div>
  //         </TooltipPopover>
  //       </Portal>
  //     }
  // </Card>

    // console.log("test")

    // return(
    //  <svg width="200" height="200">
    //     <g transform={"translate(100,100)"}>
    //       <path d={timeArc()} />
    //     </g>
    //   </svg>
    // )

  //Manage Modal State
  const [modalOpen, setModalOpen] = useState(false);
 <><button onClick={() => setModalOpen(true)}>
      Click to Open Modal</button>
      <Transition in={modalOpen} timeout={3000}>
    <Modal handleClose={() => setModalOpen(false)} modalOpen={modalOpen}>
          This is Modal Content!
        </Modal>
        </Transition>