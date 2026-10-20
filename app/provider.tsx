"use client"

import React, { useEffect, useState } from 'react'
import axios from "axios";
import { UserDetailContext } from '@/context/UserDetailContext';

function Provider({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const [userDeatil, setUserDeatil] = useState(null);

    useEffect(() => {
        createNewUser();
    }, [])

    const createNewUser = async () => {
        const result = await axios.post('/api/users');
        console.log(result);
        setUserDeatil(result.data);
    }

    return (
        <div>
            <UserDetailContext.Provider value={{ userDeatil, setUserDeatil }}>
                {children}
            </UserDetailContext.Provider>
        </div>
    )
}

export default Provider