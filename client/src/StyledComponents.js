import styled, {createGlobalStyle} from 'styled-components';

//import { useMhsClass } from './contexts/globalContext';

export const GlobalStyle = createGlobalStyle`
    body{font-family: 'Barlow', sans-serif;
}`

export const AppContainer = styled.div`
    display: grid;
    grid-template-areas:
        "controls controls"
        "list report";
    grid-template-rows: 50px 1fr ;
    grid-template-columns: 150px 1fr;
    gap: 2px;
    width: ${({ width }) => width || ''};
    height: ${ ({ height }) => height || '' };
    font-size: 14;
    justify-content: start;
    align-items: start;
    &:hover{box-shadow: 2px 4px 4px 4px rgba(0, 0, 0, 0.25)};
    background-color: ##555555;
    grid-auto-flow: column;
    overflow: hidden;
    border-radius: 0px;
    `;

//red color  #AB2328
export const ModalStyle = styled.div`
    position: fixed;
    top: 50%;
    zIndex: 1000;
    left:50%;
    transform: translate(-50%,-50%);
    background-color: rgba(255, 255, 255, 0.8)`;

export const ModalOverlayStyle = styled.div`
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left:0;
    zIndex: 1000;
    background-color: rgba(0,0,0, 0.5)`;

export const Cell = styled.div`
    display: grid;
    opacity: ${({ opacity }) => opacity || 1};
    border-color: ${({ bordercolor }) => bordercolor || '#AB2328'};
    border-style: solid;
    border-width: ${({ borderwidth }) => borderwidth || '0px 0px 0px 0px'};
    background-color: ${({ backgroundcolor }) => backgroundcolor || ''};
    color: ${({ color }) => color || 'rgba(0, 0, 0, 1)'};
    transform: scale(${({ transform })=>transform || 1},${({ transform })=>transform || 1});
    writing-mode: ${({ writingmode }) => writingmode || 'horizontal-tb'};
    justify-items: ${({ justifyitems }) => justifyitems || 'start'};
    align-items: center;
    font-size: 14;
    font-weight: ${({ fontweight }) => fontweight || 'normal'};
    padding: 2px 2px 2px 2px;
    &:hover{box-shadow: 2px 4px 4px 4px rgba(0, 0, 0, 0.25)};
    `;

export const RepCell = styled.div`
    width: ${({ width }) => width || '40px'};
    height: ${({ height }) => height || '20px'};
    border: ${({ border }) => border || ''};
    font-size: 14;
    transform: scale(${({ transform })=>transform || 1},${({ transform })=>transform || 1});
    padding: 2px 2px 2px 2px;
    display: flex;
    flex-direction: row;
    position: relative;
    flex-flow: column wrap;
    writing-mode: ${({ writingmode }) => writingmode || 'horizontal-tb'};
    justify-content: ${({ justify }) => justify || 'center'};
    align-items: ${({ align }) => align || 'center'};
    &:hover{box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.25)};
    border-radius: 2px;
    color: #AB2328
    `;

export const ControlStyle = styled.div`
    grid-area: ${({ gridarea }) => gridarea || ''};
    justify-content: ${({ justify }) => justify || 'start'};
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 4px;
    gap: 4px;
     &:hover{box-shadow: 2px 4px 4px 4px rgba(0, 0, 0, 0.25)};
    background-color: transparent;
    border-radius: 14px;
    color: #AB2328
    `;

export const BaseButton = styled.button`
    width: ${({ width }) => width || '100px'};
    height: ${({ height }) => height || '40px'};
    border: ${({ border }) => border || ''};
    grid-area: ${({ gridarea }) => gridarea || ''};
    font-size: 14;
    padding: 2px 5px;
    display: flex;
    flex-direction: row;
    flex-flow: column wrap;
    justify-content: center;
    align-items: center;
    &:hover{box-shadow: 2px 4px 4px 4px rgba(0, 0, 0, 0.25)};
    background-color: #4c8bf5;
    overflow: hidden;
    position: relative;
    border-radius: 8px;
    color: white
    `;

export const ListStyle = styled.div`
    grid-area: list;
    display: grid;
    gap: 2px;
    align-content: start;
    align-items: stretch;
    justify-items: stretch;
    &:hover{box-shadow: 2px 4px 4px 4px rgba(0, 0, 0, 0.25)};
    background-color: transparent;
    text-align: center;
    overflow: auto;
    color: #AB2328
    `;

export const ReportStyle = styled.div`
    grid-area: report;
    display: grid;
    gap: 1px;
    grid-template-columns: 144px 25px 65px ${(props) => ( props.arcols ? "repeat("+props.arcols+",minmax(40px, 1fr));":";")}
    //grid-template-columns: 145px 25px 60px ${"repeat(${({ arcols }) => arcols || '1'"}, minmax(40px, 1fr));
    // grid-template-rows: fit-content(50px) repeat(${({ rows }) => rows || '4'}, 1fr);
    position: relative;
    justify-items: ${({ justifyitems }) => justifyitems || 'stretch'};
    align-items: stretch;
    overflow: auto;
    &:hover{box-shadow: 2px 4px 4px 4px rgba(0, 0, 0, 0.25)};
    background-color: transparent;
    color: #AB2328
    `;