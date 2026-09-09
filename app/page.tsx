"use client";
import { UserButton } from '@clerk/nextjs';
import React from 'react';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <UserButton/>
    </div>
  );
}


