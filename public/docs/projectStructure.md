# 📁 Project Structure (initially)

Create this folder structure in your project:

```
src/
├── app/
│   ├── page.tsx                    # ✅ Uses HomePage component
│   ├── layout.tsx
│   ├── providers.tsx
│   └── globals.css
├── features/
│   └── home/                       # 🏠 Home feature
│       ├── components/
│       │   ├── HomePage.tsx        # ✅ Main component
│       │   ├── CreateRoomForm.tsx  # ✅ Create room form
│       │   ├── JoinRoomForm.tsx    # ✅ Join room form
│       │   └── UserNameInput.tsx   # ✅ Username input
│       ├── hooks/
│       │   ├── useCreateRoom.ts    # ✅ Create room logic
│       │   └── useJoinRoom.ts      # ✅ Join room logic
│       ├── types/
│       │   └── index.ts            # ✅ Home feature types
│       └── index.ts                # ✅ Clean exports
├── shared/
│   └── components/
│       ├── ErrorAlert.tsx          # ✅ Reusable error display
│       └── index.ts                # ✅ Shared exports
└── lib/                           # Your existing files
    ├── prisma.ts
    └── utils.ts
```
