import { Prisma } from '@prisma/client';
const safeSelect: Prisma.UserSelect = {
  uuid: true,
  email: true,
  firstName: true,
  lastName: true,
  fullName: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  country: true,
  zipCode: true,
  birthDate: true,
  profilePicture: true,
};

const userWithRoles = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    ...safeSelect,
    userRoles: {
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    },
  },
});
export type UserWithRoles = Prisma.UserGetPayload<typeof userWithRoles>;
