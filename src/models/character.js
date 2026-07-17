export function createCharacter(data = {}) {
  return {
    id: Date.now().toString(),
    name: data.name || "Novo Herói",
    hp: typeof data.hp === "number" ? data.hp : 10,
    hpMax: typeof data.hpMax === "number" ? data.hpMax : 10,
    level: typeof data.level === "number" ? data.level : 1,
    job: data.job || "",
    notes: data.notes || "",
  };
}

export function validateCharacter(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (typeof obj.name !== "string") return false;
  if (typeof obj.hp !== "number" || typeof obj.hpMax !== "number") return false;
  return true;
}

export default { createCharacter, validateCharacter };
