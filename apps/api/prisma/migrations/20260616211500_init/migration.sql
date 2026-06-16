-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ContractKind" AS ENUM ('PROXY', 'IMPLEMENTATION', 'FACTORY', 'ROUTER', 'VAULT', 'TOKEN', 'STRATEGY', 'ORACLE', 'GOVERNANCE', 'TREASURY', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationKind" AS ENUM ('PROXY', 'IMPLEMENTATION', 'FACTORY', 'VAULT', 'TOKEN', 'STRATEGY', 'DEPENDS_ON');

-- CreateEnum
CREATE TYPE "TvlSource" AS ENUM ('DEFILLAMA', 'MANUAL', 'DEMO');

-- CreateTable
CREATE TABLE "Chain" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "nativeCurrency" TEXT NOT NULL,
    "explorerBaseUrl" TEXT NOT NULL,
    "explorerAddressPath" TEXT NOT NULL DEFAULT '/address/{address}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "websiteUrl" TEXT,
    "tvlProvider" TEXT,
    "tvlProviderSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "protocolId" TEXT,
    "address" TEXT NOT NULL,
    "addressChecksum" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" "ContractKind" NOT NULL DEFAULT 'OTHER',
    "verifiedSourceUrl" TEXT,
    "repositoryUrl" TEXT,
    "sourcePath" TEXT,
    "abiUrl" TEXT,
    "tvlProvider" TEXT,
    "tvlProviderSlug" TEXT,
    "manualTvlUsd" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractRelation" (
    "id" TEXT NOT NULL,
    "fromContractId" TEXT NOT NULL,
    "toContractId" TEXT NOT NULL,
    "kind" "RelationKind" NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TvlSnapshot" (
    "id" TEXT NOT NULL,
    "contractId" TEXT,
    "protocolId" TEXT,
    "valueUsd" DOUBLE PRECISION NOT NULL,
    "source" "TvlSource" NOT NULL,
    "sourceRef" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TvlSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chain_slug_key" ON "Chain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Chain_chainId_key" ON "Chain"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "Protocol_slug_key" ON "Protocol"("slug");

-- CreateIndex
CREATE INDEX "Contract_protocolId_idx" ON "Contract"("protocolId");

-- CreateIndex
CREATE INDEX "Contract_kind_idx" ON "Contract"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_chainId_address_key" ON "Contract"("chainId", "address");

-- CreateIndex
CREATE INDEX "ContractRelation_kind_idx" ON "ContractRelation"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "ContractRelation_fromContractId_toContractId_kind_key" ON "ContractRelation"("fromContractId", "toContractId", "kind");

-- CreateIndex
CREATE INDEX "TvlSnapshot_contractId_capturedAt_idx" ON "TvlSnapshot"("contractId", "capturedAt");

-- CreateIndex
CREATE INDEX "TvlSnapshot_protocolId_capturedAt_idx" ON "TvlSnapshot"("protocolId", "capturedAt");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRelation" ADD CONSTRAINT "ContractRelation_fromContractId_fkey" FOREIGN KEY ("fromContractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRelation" ADD CONSTRAINT "ContractRelation_toContractId_fkey" FOREIGN KEY ("toContractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TvlSnapshot" ADD CONSTRAINT "TvlSnapshot_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TvlSnapshot" ADD CONSTRAINT "TvlSnapshot_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
