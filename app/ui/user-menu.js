"use client";

import { useState } from 'react';
import { useSession, signOut, signIn } from "next-auth/react";
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';

function SignInOutMenuItem({status}) {
  if (status === "authenticated") {
    return (<MenuItem onClick={signOut}>Sign Out</MenuItem>)
  } else if (status === "unauthenticated") {
    return (<MenuItem onClick={signIn}>Sign in</MenuItem>);
  } else {
    return <></>
  }
}


export default function UserMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { data: session, status } = useSession()

  return (
    <div className='flex'>
      {session && (<p>{session.user.name}</p>)}
      <IconButton
        onClick={handleOpen}
        size="small"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar alt="User" src="/user-icon.svg" sx={{ width: 32, height: 32 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 180 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <SignInOutMenuItem status={status}/>
      </Menu>
    </div>
  );
}
