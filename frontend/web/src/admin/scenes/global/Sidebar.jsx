import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Badge, Popper, Paper, ClickAwayListener, MenuList, MenuItem as MUIMenuItem } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Item = ({ title, to, icon, selected, setSelected, badgeContent }) => {
  const theme = useTheme();
  const colors = tokens();
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={
        badgeContent > 0 ? (
          <Badge badgeContent={badgeContent} color="error">
            {icon}
          </Badge>
        ) : (
          icon
        )
      }
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [chatNotifications, setChatNotifications] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch { }
  let avatar = "/assets/img/person/person-m-1.webp";
  if (user?.image) {
    if (user.image.startsWith("http")) {
      avatar = user.image;
    } else if (user.image.startsWith("/")) {
      avatar = `http://localhost:5000${user.image}`;
    } else {
      avatar = `http://localhost:5000/${user.image}`;
    }
  }
  const name = user?.name || "Tên người dùng";
  const role = user?.role || "user";

  useEffect(() => {
    socket.on('new_chat_session', () => {
      setChatNotifications(prev => prev + 1);
    });

    // Lắng nghe sự kiện cập nhật profile
    const handleProfileUpdate = (event) => {
      const { name: newName, avatar: newAvatar } = event.detail;
      // Reload user data from localStorage
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      // Force re-render by updating the component key or trigger state update
      window.location.reload();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      socket.off('new_chat_session');
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleChatClick = () => {
    setChatNotifications(0);
    setSelected("Quản lý Tin nhắn");
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
    setOpen(false);
  };

  const handleEditProfile = () => {
    navigate('/admin/profile');
    setOpen(false);
  };

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  ADMINIS
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={avatar}
                  style={{ cursor: "pointer", borderRadius: "50%", objectFit: "cover" }}
                  onClick={handleAvatarClick}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {name}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {role}
                </Typography>
              </Box>

              <Popper open={open} anchorEl={anchorEl} placement="bottom-start" style={{ zIndex: 1300 }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <Paper
                    elevation={8}
                    style={{
                      background: colors.primary[400],
                      border: `1px solid ${colors.grey[700]}`,
                      borderRadius: 8,
                      marginTop: 8
                    }}
                  >
                    <MenuList>
                      <MUIMenuItem onClick={handleEditProfile} style={{ color: colors.grey[100], padding: '12px 16px' }}>
                        <EditIcon style={{ marginRight: 8, fontSize: 20 }} />
                        <Typography>Chỉnh sửa thông tin</Typography>
                      </MUIMenuItem>
                      <MUIMenuItem onClick={handleLogout} style={{ color: colors.grey[100], padding: '12px 16px' }}>
                        <LogoutIcon style={{ marginRight: 8, fontSize: 20 }} />
                        <Typography>Đăng xuất</Typography>
                      </MUIMenuItem>
                    </MenuList>
                  </Paper>
                </ClickAwayListener>
              </Popper>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Bảng điều khiển"
              to="/admin/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />


            <Item
              title="Danh sách khách hàng"
              to="/admin/users/customers"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Danh sách nhân sự"
              to="/admin/users/staffs"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Quản lý Danh mục"
              to="/admin/category"
              icon={<CategoryOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Quản lý Sản phẩm"
              to="/admin/products"
              icon={<Inventory2OutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Quản lý Đơn hàng"
              to="/admin/bill"
              icon={<Inventory2OutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Quản lý Banner"
              to="/admin/banners"
              icon={<PhotoLibraryOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Quản lý Voucher"
              to="/admin/voucher"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Quản lý Tin nhắn"
              to="/admin/chat-management"
              icon={<ChatOutlinedIcon />}
              selected={selected}
              setSelected={handleChatClick}
              badgeContent={chatNotifications}
            />
            <Item
              title="Quản lý bình luận"
              to="/admin/comments"
              icon={<ChatOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
