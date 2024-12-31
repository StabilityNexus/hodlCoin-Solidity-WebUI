'use client';

import ExplorerVaults from '@/components/Explorer/ExplorerVaults';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExplorerPage() {
  const router = useRouter();

  const handleCreateVault = () => {
    router.push('/createVault');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="w-full">
        {/* Header Section */}
        <div className="justify-between items-center pt-14 mb-6">
          <h1 className="text-4xl font-bold dark:text-yellow-400 text-amber-500">
            Vault Archive
          </h1>
          <div className="mb-8 flex items-center">
            <h4 className="dark:text-purple-50 text-gray-900 text-lg pl-1 flex-grow">
              Welcome to the central repository for accessing all previous vaults on various chains.
            </h4>
            <Button
              variant="outline"
              className="ml-auto flex gap-3 h-auto p-4 dark:bg-zinc-900 bg-purple-50
              dark:hover:border-purple-500 hover:border-purple-300
              transition-colors duration-200"
              onClick={handleCreateVault}
            >
              <PlusCircle className="h-5 w-5 dark:text-purple-400 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold dark:text-white text-purple-900">
                  Create Vault
                </div>
                <div className="text-sm dark:text-white text-purple-700">
                  Create your new vault
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Vault Explorer Section */}
        <div className="w-full flex justify-center pb-[20vh] overflow-x-hidden">
          <ExplorerVaults />
        </div>
      </div>
    </main>
  );
}
