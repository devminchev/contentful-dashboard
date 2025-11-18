import {
    ListContainer,
    RowWrapper,
    ColumnListContainer
} from '../common/styles/mixins';

export const IndexStatsList = ({ stats }) => {
    const baseRowStyle = {
        margin: '24px auto',
        width: '460px',
        display: 'block',
        borderBottom: '1px solid #6b97da',
        textAlign: 'justify'
    };
    const headerRowStyle = { ...baseRowStyle, borderBottom: '2px solid #ffffff' };
    const indexCellStyle = {
        display: 'inline-block',
        width: '260px',
        marginRight: '10px',
        textAlign: 'left'
    };

    return (
        <ListContainer style={{ margin: '16px auto 100px' }}>
            <ColumnListContainer style={{ height: '20px' }}>
                <RowWrapper style={headerRowStyle}>
                    <p style={{ ...indexCellStyle, fontWeight: 'bold', fontSize: '1rem' }}>
                        Index Name
                    </p>
                    <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Num of Docs</span>
                </RowWrapper>
            </ColumnListContainer>
            {stats.map(({ index, docsCount }) => (
                <ColumnListContainer key={index} style={{ height: '20px' }}>
                    <RowWrapper style={baseRowStyle}>
                        <p style={indexCellStyle}>{index}</p>
                        <span><strong>{docsCount.toLocaleString()}</strong></span>
                    </RowWrapper>
                </ColumnListContainer>
            ))}
        </ListContainer>
    );
};
