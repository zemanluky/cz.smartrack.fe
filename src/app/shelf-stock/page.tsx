// src/app/organizations/shelf-stock/page.tsx
import React from 'react';

const OrgShelfStockPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Správa Skladu Organizace</h1>
      <p>
        Tato stránka bude sloužit uživatelům organizace (adminům i běžným uživatelům)
        k prohlížení regálů jejich organizace a správě jejich obsahu.
      </p>
      <p>Funkcionalita zahrne přiřazování produktů na pozice, nastavování kapacit, sledování zásob atd.</p>
      <p className="mt-4 font-semibold">Obsah je ve vývoji.</p>
    </div>
  );
};

export default OrgShelfStockPage;
