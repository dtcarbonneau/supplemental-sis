//import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import {
  UserStatus, SaveAttendanceButton, StartEndClassButton, ReportAttendanceButton,
  TakeAttendanceButton
} from './ControlButtons.js';
import { GlobalStyle, AppContainer, ControlStyle } from './StyledComponents.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MhsClassList } from './mhsClassList.js';
import { TakeAttendance } from './takeAttendance.js'
import {SubmissionReport} from './submissionReport.js'
import {useClientContext, ClientContextProvider} from './clientState.js';

function App() {
  const { state } = useClientContext();
  return (
    <AppContainer>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <GlobalStyle />
        <ControlStyle gridarea="controls" justify="end">
          <UserStatus />
        </ControlStyle>
          {state?.user_email ? <MhsClassList gridarea="list"/> : ""}
        <ControlStyle gridarea="controls">
          {state?.mhsClassIndex + 1 && state?.mode === "InitialOptions" ?
          <><TakeAttendanceButton/><ReportAttendanceButton/></> : ""}
        {state?.mode === "TakeAttendance" && state?.user_email ?
          <StartEndClassButton /> : ""}
        {state?.mode === "SaveAttendance" && state?.user_email ?
          <SaveAttendanceButton /> : ""}
        </ControlStyle>
      {state?.mode === "TakeAttendance" && state?.user_email ?
          <TakeAttendance />: ""}
      {state?.mode === "ReportAttendance" ?
        // <AttendanceReport/>:""}
         <SubmissionReport /> : ""}
      {/* <div style={{ display:"flex", gridarea:"nav" }}>
      {state.mhsClassIndex ? <StartEndClassButton /> : ""}
      {state.attendance.length > 0 && state.display === "mhsClasses" ? <SaveAttendanceButton /> : ""}
      {state.display === "mhsClasses" && state.mhsClassIndex ?  : ""}
    </div> */}
      {/* {state.display === "mhsClasses" && state.mhsClassIndex ?
      <AttendanceGrid /> : ""} */}
    </AppContainer>)}


function Index() {
  const client = new QueryClient();
  return (<QueryClientProvider client={client}>
    <ClientContextProvider><App/>
    </ClientContextProvider></QueryClientProvider>)
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<Index />);
