import { Cell, ListStyle } from './StyledComponents.js';
import { useMhsClassesQuery } from './serverStateQueries.js';
import { useClientContext } from './clientState.js';

export function MhsClassList() {
    const { state, dispatch } = useClientContext();
    const {
        isLoading,
        isError,
        data:mhsClasses
        } = useMhsClassesQuery('Q2')

    if (isLoading) return "Loading...";
    if (isError) return <pre>{Error.message}</pre>
    return (
        <ListStyle >
            {mhsClasses.map((c,index) => (
            <Cell width='140' onClick={() => {
                    dispatch({
                        type: 'SELECT_CLASS',
                        mhsClassIndex: state.mhsClassIndex != index ? index : null,
                        //mhsClassName: state.mhsClassName != c.name ? c.name: null,
                        //mhsClassId: state.mhsClassId != c.id ? c.id: null,
                    })
                    dispatch({
                        type: 'CHANGE_MODE',
                        payload: 'InitialOptions'
                });
            }}
                key={index} justifyitems="center"
                borderwidth={index === state.mhsClassIndex ? '2px 2px 2px 2px':""}>{c.name} </Cell>
        ))}
        </ListStyle>
    );
     };
