import styled from 'styled-components';

export const PageWrapper = styled.div`
    text-align: center;
    margin-top: 85px;

    h1 {
        line-height: 50px;
        margin-bottom: 20px;
    }
`;

export const ListWrapper = styled.div`
    width: 100%;
`;

export const ListHeader = styled.header`
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-weight: 900;
    font-size:20px;
    padding:10px;
    background-image: linear-gradient(to right, #263a7b, #020a18 95%);
    border-radius: 3px;
    width: 100%;
`;

export const ListItemWrapper = styled.div`
    display: flex;
`;

export const ListItem = styled.div`
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
    margin: 3px;
    height: 50px;
    color: #fff;
    border: none;
    position: relative;
    border-radius: 3px;
    background: #2f3644;
`;

export const ListRowItem = styled.div`
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
    height: 50px;
    color: #fff;
    border: none;
    position: relative;
    background: #2f3644;
`;

export const ListItemBtn = styled.button`
  margin: 3px;
  width: 150px;
  height: 50px;
  color: #fff;
  border: none;
  position: relative;
  transition: all ease .05s;
  box-shadow: inset 0 0 1px 0 rgba(255, 255, 255, .1);
  background-image: linear-gradient(to bottom, #374256, #0e141e);
  border-radius: 3px;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 25px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
  }

  &:hover,
  &.active {
    box-shadow: inset 0 0 49px 0 #000;
    background-image: linear-gradient(to bottom, #ff9800, #663c00);
    font-weight: 900;
  }

  &:disabled {
    background: #808080;
    box-shadow: none;
    cursor: not-allowed;
    &:hover {
      box-shadow: none;
      background: #808080;
    }
  }
`;

export const ListContainer = styled.div`
    width: 100%;
`;

export const ColumnListContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 5px;
    position: relative;
`;

export const RowWrapper = styled.div`
    display: flex;
`;
