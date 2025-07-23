import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AdminChatManager from "../../components/AdminChatManager"; // Import AdminChatManager

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Tìm kiếm" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex" alignItems="center"> {/* Thêm alignItems="center" */}
        <AdminChatManager adminUsername="Admin" />

        <IconButton>
          <SettingsOutlinedIcon />

        </IconButton>
        <Box ref={anchorRef} position="relative">
          <IconButton onClick={() => setOpen((prev) => !prev)}>
            <PersonOutlinedIcon />
          </IconButton>
          {open && (
            <Box position="absolute" right={0} top={40} bgcolor={colors.primary[400]} borderRadius={2} boxShadow={3} zIndex={10} minWidth={120}>
              <Box p={1}>
                <Box
                  sx={{ cursor: "pointer", color: colors.redAccent[400], fontWeight: 600, textAlign: "center" }}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;
