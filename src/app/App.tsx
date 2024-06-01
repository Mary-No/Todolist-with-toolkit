import React, {useCallback, useEffect} from 'react'
import './App.css'
import {TodolistsList} from 'features/TodolistsList/TodolistsList'
import {ErrorSnackbar} from 'components/ErrorSnackbar/ErrorSnackbar'
import {useDispatch, useSelector} from 'react-redux'
import {AppRootStateType} from './store'
import {initializeAppTC, RequestStatusType} from 'app/appSlice'
import {BrowserRouter, HashRouter, Route, Routes} from 'react-router-dom'
import {Login} from 'features/Login/Login'
import {logoutTC} from 'features/Login/authSlice'
import {
    AppBar, Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    LinearProgress,
    Toolbar,
    Typography
} from '@mui/material';
import {Menu} from '@mui/icons-material'

type PropsType = {
    demo?: boolean
}

function App({demo = false}: PropsType) {
    const status = useSelector<AppRootStateType, RequestStatusType>((state) => state.app.status)
    const isInitialized = useSelector<AppRootStateType, boolean>((state) => state.app.isInitialized)
    const isLoggedIn = useSelector<AppRootStateType, boolean>(state => state.auth.isLoggedIn)
    const dispatch = useDispatch<any>()

    useEffect(() => {
        dispatch(initializeAppTC())
    }, [])

    const logoutHandler = useCallback(() => {
        dispatch(logoutTC())
    }, [])

    if (!isInitialized) {
        return <div
            style={{position: 'fixed', top: '30%', textAlign: 'center', width: '100%'}}>
            <CircularProgress/>
        </div>
    }

    return (
        <HashRouter>
            <div className="App">
                <ErrorSnackbar/>
                <Box sx={{flexGrow: 1}}>
                    <AppBar position="static">
                        <Toolbar>
                            <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{mr:2}}>
                                <Menu/>
                            </IconButton>
                            <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                                News
                            </Typography>
                            {isLoggedIn && <Button color="inherit" onClick={logoutHandler}>Log out</Button>}
                        </Toolbar>
                        {status === 'loading' && <LinearProgress/>}
                    </AppBar>
                </Box>
                <Container fixed>
                    <Routes>
                        <Route path={'/'} element={<TodolistsList demo={demo}/>}/>
                        <Route path={'/login'} element={<Login/>}/>
                    </Routes>
                </Container>
            </div>
        </HashRouter>
    )
}

export default App
