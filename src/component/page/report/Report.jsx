import React from 'react';
import {Link} from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import styled from '@emotion/styled';

const IconContainer = styled.div`
  background-color: #1976d2;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const ReportCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const ReportName = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const Report = () => {
    const reportItems = [
        {
            path: '/report/student',
            name: 'Student Report',
            icon: <IconContainer><PeopleIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/attendance',
            name: 'Attendance Report',
            icon: <IconContainer><EventAvailableIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/fee',
            name: 'Fee Report',
            icon: <IconContainer><MonetizationOnIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/fee/due',
            name: 'Fee Due Report',
            icon: <IconContainer><AccountBalanceWalletIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/exam',
            name: 'Exam Results',
            icon: <IconContainer><AssessmentIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/performance',
            name: 'Academic Performance',
            icon: <IconContainer><TrendingUpIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/bonafide',
            name: 'Bonafide',
            icon: <IconContainer><VerifiedUserIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/character',
            name: 'Character',
            icon: <IconContainer><DescriptionIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/staff',
            name: 'Staff Report',
            icon: <IconContainer><GroupIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/library',
            name: 'Library Report',
            icon: <IconContainer><MenuBookIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/transport',
            name: 'Transport Report',
            icon: <IconContainer><DirectionsBusIcon style={{color: 'white'}}/></IconContainer>
        },
        {
            path: '/report/expenses',
            name: 'Expense Report',
            icon: <IconContainer><MoneyOffIcon style={{color: 'white'}}/></IconContainer>
        }
    ];

    return (
        <div>
            <h2 style={{padding: '20px 20px 0'}}>Reports</h2>
            <ReportGrid>
                {reportItems.map((item, index) => (
                    <ReportCard key={index} to={item.path}>
                        {item.icon}
                        <ReportName>{item.name}</ReportName>
                    </ReportCard>
                ))}
            </ReportGrid>
        </div>
    );
};

export default Report; 