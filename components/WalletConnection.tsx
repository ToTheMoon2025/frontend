"use client"

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronRight, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function toFixed(num: number, fixed: number): string {
  const re = new RegExp(`^-?\\d+(?:\\.\\d{0,${fixed || -1}})?`);
  return num.toString().match(re)![0];
}

const WalletConnection = () => {
  const { connection } = useConnection();
  const { select, wallets, publicKey, disconnect, connecting } = useWallet();

  const [open, setOpen] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [userWalletAddress, setUserWalletAddress] = useState<string>("");
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false);

  // ... (keep existing useEffect and handler functions)

  const handleLoginSignup = () => {
    // Implement your login/signup logic here
    console.log("Login/Signup clicked");
    setShowAuthDialog(true);
  };

  const handleDisconnect = () => {
    console.log("Disconnected")
  }

  return (
    <div className="fixed top-4 right-4 flex items-center justify-end gap-2 z-50">
      {/* Web2 Login/Signup Button */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogTrigger asChild>
          <Button 
            className="bg-black text-[20px] md:text-[30px] text-white ring-black ring-2 h-[40px] md:h-[60px] border-2 border-white font-slackey flex gap-2 items-center"
            onClick={handleLoginSignup}
          >
            <UserPlus className="w-6 h-6" />
            Login/Signup
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="max-w-[450px] bg-black"
          style={{
            borderRadius: "30px",
          }}
        >
          <DialogTitle className="text-white text-center text-lg">Login or Create Account</DialogTitle>
          <div className="flex w-full justify-center items-center">
            <div className="flex flex-col justify-start items-center space-y-5 w-[300px] md:w-[400px]">
              <Button
                onClick={() => {
                  console.log("Login clicked");
                }}
                variant={"ghost"}
                className="h-[40px] hover:bg-transparent hover:text-white text-[20px] text-white font-slackey flex w-full justify-center items-center"
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  console.log("Sign up clicked");
                }}
                variant={"ghost"}
                className="h-[40px] hover:bg-transparent hover:text-white text-[20px] text-white font-slackey flex w-full justify-center items-center"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Web3 Wallet Connection */}
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center">
          {!publicKey ? (
            <>
              <DialogTrigger asChild>
                <Button className="bg-black text-[20px] md:text-[30px] text-white ring-black ring-2 h-[40px] md:h-[60px] border-2 border-white font-slackey">
                  {connecting ? "connecting..." : "Connect Wallet"}
                </Button>
              </DialogTrigger>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex gap-2 bg-black text-[20px] md:text-[30px] text-white ring-black ring-2 h-[40px] md:h-[60px] border-2 border-white font-slackey">
                  <div>
                    <div className="truncate md:w-[150px] w-[100px]">
                      {publicKey.toBase58()}
                    </div>
                  </div>
                  {balance ? (
                    <div>{toFixed(balance, 2)} SOL</div>
                  ) : (
                    <div>0 SOL</div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] bg-black hover:bg-black">
                <DropdownMenuItem className="flex justify-center">
                  <Button
                    className="bg-[#ff5555] text-[20px] text-white border-2 border-white font-slackey"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DialogContent
            className="max-w-[450px] bg-black"
            style={{
              borderRadius: "30px",
            }}
          >
            <DialogTitle className="text-white text-center text-lg">Select a Wallet</DialogTitle>
            <div className="flex w-full justify-center items-center">
              <div className="flex flex-col justify-start items-center space-y-5 w-[300px] md:w-[400px] overflow-y-auto">
                {wallets.map((wallet) => (
                  <Button
                    key={wallet.adapter.name}
                    onClick={() => handleWalletSelect(wallet.adapter.name)}
                    variant={"ghost"}
                    className="h-[40px] hover:bg-transparent hover:text-white text-[20px] text-white font-slackey flex w-full justify-center items-center"
                  >
                    <div className="flex">
                      <Image
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                        height={30}
                        width={30}
                        className="mr-5"
                      />
                    </div>
                    <div className="font-slackey text-white wallet-name text-[20px]">
                      {wallet.adapter.name}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </div>
      </Dialog>
    </div>
  );
};

export default WalletConnection;