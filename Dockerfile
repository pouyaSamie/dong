FROM docker.arvancloud.ir/node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npx prisma generate && npm run build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static
RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 3000
CMD ["node", "server.js"]

# Build this target only when database migrations change. Keeping Prisma's CLI
# out of the normal runtime image makes routine application releases smaller.
FROM build AS migration
ENV NODE_ENV=production
ENTRYPOINT ["npx", "prisma", "migrate", "deploy"]
