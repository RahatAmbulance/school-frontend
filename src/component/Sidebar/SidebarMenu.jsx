import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import styled from 'styled-components';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {Tooltip, Zoom} from '@mui/material';

const MenuContainer = styled(motion.div)`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const MenuButton = styled.div`
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    margin: 0.2rem 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    background: ${props => props.isOpen ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
    font-size: 13px;

    &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: ${props => props.isOpen ? '70%' : '0'};
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 0 4px 4px 0;
        transition: height 0.3s ease;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: white;
        transform: translateX(5px);

        &:before {
            height: 70%;
        }
    }
`;

const CustomTooltip = styled(({className, ...props}) => (
    <Tooltip {...props} classes={{popper: className}}/>
))`
    & .MuiTooltip-tooltip {
        background: rgba(30, 30, 45, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
`;

const MenuIcon = styled.div`
    margin-right: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        font-size: 18px;
    }
`;

const MenuText = styled.span`
    flex: 1;
    white-space: nowrap;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.2px;
`;

const ArrowIcon = styled(motion.div)`
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.5);
    transition: color 0.3s ease;

    svg {
        font-size: 18px;
    }

    ${MenuButton}:hover & {
        color: white;
    }
`;

const SubMenuContainer = styled(motion.div)`
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-left: ${props => props.isOpen ? '0.8rem' : '0'};
    padding-left: 0.8rem;
    border-left: 1px dashed rgba(255, 255, 255, 0.1);
`;

const StyledNavLink = styled(NavLink)`
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    margin: 0.2rem 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    font-size: 13px;

    &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 0;
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 0 4px 4px 0;
        transition: height 0.3s ease;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;
        transform: translateX(5px);

        &:before {
            height: 70%;
        }
    }

    &.active {
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
        color: white;

        &:before {
            height: 70%;
        }

        .icon {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-color: rgba(255, 255, 255, 0.1);

            svg {
                color: white;
            }
        }
    }
`;

const SubMenuIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-right: 0.8rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;

    svg {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.3s ease;
    }

    ${StyledNavLink}:hover & {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.1);

        svg {
            color: white;
        }
    }
`;

const menuAnimation = {
    hidden: {
        height: 0,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    },
    show: {
        height: 'auto',
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

const SidebarMenu = ({route, isOpen, showAnimation}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuButton = (
        <MenuButton onClick={toggleMenu} isOpen={isMenuOpen}>
            <MenuIcon>{route.icon}</MenuIcon>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={showAnimation}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        style={{display: 'flex', alignItems: 'center', flex: 1}}
                    >
                        <MenuText>{route.name}</MenuText>
                        <ArrowIcon
                            animate={{rotate: isMenuOpen ? 90 : 0}}
                            transition={{duration: 0.2}}
                        >
                            <KeyboardArrowRightIcon/>
                        </ArrowIcon>
                    </motion.div>
                )}
            </AnimatePresence>
        </MenuButton>
    );

    return (
        <MenuContainer>
            {!isOpen ? (
                <CustomTooltip
                    title={route.name}
                    placement="right"
                    TransitionComponent={Zoom}
                    arrow
                >
                    <div>{menuButton}</div>
                </CustomTooltip>
            ) : (
                menuButton
            )}

            <AnimatePresence>
                {isMenuOpen && (
                    <SubMenuContainer
                        variants={menuAnimation}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        isOpen={isOpen}
                    >
                        {route.subRoutes.map((subRoute, i) => {
                            const subMenuItem = (
                                <StyledNavLink
                                    to={subRoute.path}
                                    key={i}
                                    className={({isActive}) => isActive ? 'active' : ''}
                                >
                                    <SubMenuIcon className="icon">
                                        {subRoute.icon}
                                    </SubMenuIcon>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                variants={showAnimation}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                            >
                                                {subRoute.name}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </StyledNavLink>
                            );

                            return !isOpen ? (
                                <CustomTooltip
                                    key={i}
                                    title={subRoute.name}
                                    placement="right"
                                    TransitionComponent={Zoom}
                                    arrow
                                >
                                    <div>{subMenuItem}</div>
                                </CustomTooltip>
                            ) : (
                                subMenuItem
                            );
                        })}
                    </SubMenuContainer>
                )}
            </AnimatePresence>
        </MenuContainer>
    );
};

export default SidebarMenu;
