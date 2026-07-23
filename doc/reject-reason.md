# 拒绝原因列表

拒绝原因根据异常发生时机的不同，分为以下类型：

- `PARAMETER`：函数参数错误，前置检查不通过，函数主行为尚未运行。
- `SYSTEM`：系统错误，函数不具备运行所需的环境条件或系统配置冲突。
- `ACCESS`：访问错误，尝试访问文件时出现异常。
- `WRITE`：写入错误，尝试写入文件时出现异常。
- `DELETE`：删除错误，尝试删除文件时出现异常。
- `FAILED`：测试失败，后置检查不通过，函数主行为已运行，可能仍有产物提交。

## 参数

| 代码 | 说明 |
| - | - |
| `PARAMETER__ABSOLUTE_PATH_ONLY` | 仅限绝对路径。 |
| `PARAMETER__TYPE_ERROR` | 参数类型错误。 |
| `PARAMETER__VALUE_INVALID` | 无效的参数值。 |

## 系统

| 代码 | 说明 |
| - | - |
| `SYSTEM__FILE_SYSTEM_ACCESS_API_UNAVAILABLE` | File System Access API 不可用。 |
| `SYSTEM__MAX_PATH_LENGTH_EXCEED` | 请求的路径超过最大路径长度。 |
| `SYSTEM__NOT_READY` | 文件管理器尚未选取本地目录，或访问请求被拒绝。 |
| `SYSTEM__PICK_DIRECTORY_ABORT` | 请求选取本地目录被取消，或选择的目录为敏感目录。 |
| `SYSTEM__READ_ONLY` | 文件管理器处于只读模式。 |
| `SYSTEM__SECURITY_ERROR` | 被浏览器安全策略阻止。 |
| `SYSTEM__UNKNOW_ERROR` | 发生未知错误。 |

## 文件访问

| 代码 | 说明 |
| - | - |
| `ACCESS__FILE_NOT_FOUND` | 文件未找到。 |
| `ACCESS__ROOT_DIRECTORY_RETURN` | 试图在根目录返回上一级。 |

## 文件写入

| 代码 | 说明 |
| - | - |
| `WRITE__ABORT` | 写入被浏览器安全扫描拒绝。 |
| `WRITE__DIRECTORY_NAME_OCCUPIED` | 要创建的文件名被目录占用。 |
| `WRITE__FILE_NAME_OCCUPIED` | 要创建的目录名被文件占用。 |
| `WRITE__FILE_NAME_UNACCEPTABLE` | 文件名包含不可接受的字符。 |
| `WRITE__NO_MODIFICATION_ALLOWED` | 浏览器无法获取与文件句柄关联的文件的锁。 |
| `WRITE__QUOTA_EXCEEDED` | 磁盘空间不足。 |
| `WRITE__UNKNOW_ERROR` | 写入时发生未知错误。 |

## 文件删除

| 代码 | 说明 |
| - | - |
| `DELETE__HAS_CHILDREN` | 目录中包含文件，请使用递归删除 `deleteDirectory()`。 |

## 测试失败

| 代码 | 说明 |
| - | - |
| `FAILED__PATH_INCLUDE_FILE` | `directory_only` 为 `true` 时，路径中包含文件。 |
| `FAILED__PATH_LAST_NOT_FILE` | `last_must_file` 为 `true` 时，路径末尾并非文件。 |
| `FAILED__PATH_UNREACHABLE` | `uninterruptible` 为 `true` 时，路径中途出现了文件。 |