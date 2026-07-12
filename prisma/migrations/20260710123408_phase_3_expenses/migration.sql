-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "payerPersonId" TEXT NOT NULL,
    "expenseDate" DATETIME NOT NULL,
    "amountRial" BIGINT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Expense_payerPersonId_fkey" FOREIGN KEY ("payerPersonId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpenseShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expenseId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "shareRial" BIGINT NOT NULL,
    CONSTRAINT "ExpenseShare_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExpenseShare_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Expense_tripId_expenseDate_idx" ON "Expense"("tripId", "expenseDate");

-- CreateIndex
CREATE INDEX "ExpenseShare_expenseId_personId_idx" ON "ExpenseShare"("expenseId", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseShare_expenseId_personId_key" ON "ExpenseShare"("expenseId", "personId");
