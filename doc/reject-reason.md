# 拒绝原因列表

## 参数

| 代码 | 说明 |
| - | - |
| `PARAMETER__VALUE_INVALID` | 无效的参数值。 |
| `PARAMETER__TYPE_ERROR` | 参数类型错误。 |

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