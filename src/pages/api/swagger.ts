import type { NextApiRequest, NextApiResponse } from "next";

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "QLPL Demo API",
    version: "1.0.0",
    description:
      "Tài liệu API cho hệ thống quản lý phòng máy. Tất cả endpoint chính đều yêu cầu xác thực bằng cookie token hoặc Authorization header.",
  },
  servers: [
    {
      url: "/api",
      description: "Server nội bộ của ứng dụng",
    },
  ],
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          username: { type: "string" },
          full_name: { type: ["string", "null"] },
          email: { type: ["string", "null"] },
          mssv: { type: ["string", "null"] },
          class: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          gender: { type: ["string", "null"] },
          avatar_url: { type: ["string", "null"] },
          is_admin: { type: "boolean" },
          profile_completed: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Computer: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          room: { type: "string" },
          specs: { type: ["string", "null"] },
          status: { type: "string", enum: ["available", "in_use", "maintenance"] },
          created_at: { type: "string", format: "date-time" },
        },
      },
      BorrowRequest: {
        type: "object",
        properties: {
          id: { type: "integer" },
          computer_id: { type: "integer" },
          borrower_id: { type: "integer" },
          reason: { type: ["string", "null"] },
          status: { type: "string", enum: ["pending", "approved", "rejected", "returned"] },
          requested_at: { type: "string", format: "date-time" },
          approved_by: { type: ["integer", "null"] },
          approved_at: { type: ["string", "null"], format: "date-time" },
          returned_at: { type: ["string", "null"], format: "date-time" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Đăng ký tài khoản",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                  full_name: { type: ["string", "null"] },
                  email: { type: ["string", "null"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Tạo tài khoản thành công" },
          "400": { description: "Dữ liệu không hợp lệ" },
          "409": { description: "Username đã tồn tại" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Đăng nhập",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Đăng nhập thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/schemas/ErrorResponse" },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Đăng xuất",
        tags: ["Auth"],
        responses: {
          "200": { description: "Đăng xuất thành công" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Lấy thông tin người dùng hiện tại",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "Thông tin người dùng",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { description: "Chưa đăng nhập" },
        },
      },
    },
    "/computers": {
      get: {
        summary: "Lấy danh sách máy tính",
        tags: ["Computers"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "Danh sách máy tính",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    computers: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Computer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Thêm máy tính mới",
        tags: ["Computers"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "room"],
                properties: {
                  name: { type: "string" },
                  room: { type: "string" },
                  specs: { type: ["string", "null"] },
                  status: { type: "string", enum: ["available", "in_use", "maintenance"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Thêm máy thành công" },
          "403": { description: "Không có quyền quản lý" },
        },
      },
    },
    "/computers/{id}": {
      get: {
        summary: "Lấy chi tiết máy tính theo ID",
        tags: ["Computers"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Chi tiết máy tính",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    computer: { $ref: "#/components/schemas/Computer" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: "Cập nhật máy tính",
        tags: ["Computers"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  room: { type: "string" },
                  specs: { type: ["string", "null"] },
                  status: { type: "string", enum: ["available", "in_use", "maintenance"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Cập nhật máy thành công" },
          "403": { description: "Không có quyền quản lý" },
        },
      },
      delete: {
        summary: "Xoá máy tính",
        tags: ["Computers"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Xoá máy tính thành công" },
          "403": { description: "Không có quyền quản lý" },
        },
      },
    },
    "/computer-borrow-requests": {
      get: {
        summary: "Lấy danh sách yêu cầu mượn máy",
        tags: ["Borrow Requests"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "Danh sách yêu cầu mượn máy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    requests: {
                      type: "array",
                      items: { $ref: "#/components/schemas/BorrowRequest" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Gửi yêu cầu mượn máy",
        tags: ["Borrow Requests"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["computer_id"],
                properties: {
                  computer_id: { type: "integer" },
                  reason: { type: ["string", "null"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Yêu cầu đã được gửi" },
          "409": { description: "Máy không còn khả dụng hoặc đang có yêu cầu chờ duyệt" },
        },
      },
    },
    "/computer-borrow-requests/{id}": {
      patch: {
        summary: "Duyệt / từ chối / trả máy",
        tags: ["Borrow Requests"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action"],
                properties: {
                  action: { type: "string", enum: ["approve", "reject", "return"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Cập nhật yêu cầu thành công" },
          "403": { description: "Không có quyền quản trị" },
        },
      },
    },
    "/dashboard": {
      get: {
        summary: "Lấy dữ liệu dashboard",
        tags: ["Dashboard"],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": { description: "Dữ liệu tổng quan hệ thống" },
        },
      },
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  return res.status(200).json(openApiSpec);
}
