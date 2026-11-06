import { ContratoItem } from "./ContratoItem";

/**
 * Lista de contratos
 * Renderiza cada contrato como um item interativo
 *
 * @param {Array} contracts - Array de contratos
 * @param {Function} onUpdateContract - Callback ao atualizar contrato
 * @param {Function} onRemoveContract - Callback ao remover contrato
 */
export function ContratoList({
  contracts,
  onUpdateContract,
  onRemoveContract,
}) {
  return (
    <>
      {contracts.map((contract) => (
        <ContratoItem
          key={contract.id}
          contract={contract}
          onUpdate={onUpdateContract}
          onRemove={onRemoveContract}
        />
      ))}
    </>
  );
}
