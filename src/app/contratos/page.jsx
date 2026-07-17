"use client";

import React from "react";
import { FileText } from "lucide-react";
import { SectionHeader, Card } from "../components/ui";
import { useCharacter } from "../context/CharacterContext";
import { ContratoHeader } from "../components/contratos/ContratoHeader";
import { ContratoList } from "../components/contratos/ContratoList";
import { ContratoEmpty } from "../components/contratos/ContratoEmpty";

/**
 * Página principal de Contratos
 * Gerencia criação, edição e exclusão de contratos
 * Permite marcar contratos como concluídos
 */
export default function ContratoPage() {
  const { data, addContract, updContract, removeContract } = useCharacter();

  const hasContratos = data.contracts.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        {/* Header com título e botão de novo contrato */}
        <ContratoHeader onAddContract={addContract} />

        {/* Lista de contratos ou mensagem vazia */}
        <div className="space-y-3">
          {hasContratos ? (
            <ContratoList
              contracts={data.contracts}
              onUpdateContract={updContract}
              onRemoveContract={removeContract}
            />
          ) : (
            <ContratoEmpty />
          )}
        </div>
      </Card>
    </div>
  );
}
