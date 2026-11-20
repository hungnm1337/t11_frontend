"use client";

import * as React from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MASTER_DATA_DEFINITIONS } from "@/lib/master-data-definitions";
import {
  createMasterData,
  deleteMasterData,
  getMasterDataById,
  getMasterDataOptions,
  getMasterDataPage,
  MasterDataApiError,
  updateMasterData,
} from "@/services/masterDataService";
import {
  MasterDataRequestMap,
  MasterDataResource,
  MasterDataResponseMap,
} from "@/types/master-data";

type MasterDataRow = MasterDataResponseMap[MasterDataResource];
type FormMode = "create" | "edit" | "view";

interface RelationOption {
  value: string;
  label: string;
}

interface MasterDataManagerProps {
  resource: MasterDataResource;
}

const PAGE_SIZE = 20;

function rowValue(row: MasterDataRow, key: string): unknown {
  return Reflect.get(row, key);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function MasterDataManager({ resource }: MasterDataManagerProps) {
  const definition = MASTER_DATA_DEFINITIONS[resource];
  const [items, setItems] = React.useState<MasterDataRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [relationsRevision, setRelationsRevision] = React.useState(0);
  const [relationOptions, setRelationOptions] = React.useState<
    Record<string, RelationOption[]>
  >({});
  const [formMode, setFormMode] = React.useState<FormMode | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<MasterDataRow | null>(
    null
  );
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  const loadPage = React.useCallback(async (requestedPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMasterDataPage(resource, requestedPage, PAGE_SIZE);
      setItems(result.items);
      setTotal(result.total);
      setPage(result.page);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Không thể tải dữ liệu."
      );
    } finally {
      setIsLoading(false);
    }
  }, [resource]);

  React.useEffect(() => {
    let active = true;
    const loadInitialPage = async () => {
      try {
        const result = await getMasterDataPage(resource, 1, PAGE_SIZE);
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof Error ? caught.message : "Không thể tải dữ liệu."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadInitialPage();
    return () => {
      active = false;
    };
  }, [resource]);

  React.useEffect(() => {
    let active = true;
    const relations = Array.from(
      new Set(
        definition.fields
          .map((field) => field.relation)
          .filter((relation): relation is MasterDataResource => !!relation)
      )
    );

    Promise.all(
      relations.map(async (relation) => {
        const options = await getMasterDataOptions(relation);
        const relatedDefinition = MASTER_DATA_DEFINITIONS[relation];
        return [
          relation,
          options.map((option) => ({
            value: String(rowValue(option, relatedDefinition.idField)),
            label: `${String(rowValue(option, relatedDefinition.idField))} — ${String(
              rowValue(option, relatedDefinition.nameField) ?? ""
            )}`,
          })),
        ] as const;
      })
    )
      .then((entries) => {
        if (active) setRelationOptions(Object.fromEntries(entries));
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Không thể tải dữ liệu tham chiếu."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [definition, relationsRevision]);

  const openForm = (mode: Exclude<FormMode, "view">, item?: MasterDataRow) => {
    setSelectedItem(item ?? null);
    setFieldErrors({});
    setFormError(null);
    setFormData(
      Object.fromEntries(
        definition.fields.map((field) => [
          field.key,
          item ? String(rowValue(item, field.key) ?? "") : "",
        ])
      )
    );
    setFormMode(mode);
  };

  const openDetail = async (item: MasterDataRow) => {
    const id = String(rowValue(item, definition.idField));
    setSelectedItem(item);
    setFormMode("view");
    setIsLoadingDetail(true);
    try {
      setSelectedItem(await getMasterDataById(resource, id));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Không thể tải chi tiết bản ghi."
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setFormMode(null);
    setSelectedItem(null);
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextFieldErrors: Record<string, string> = {};
    for (const field of definition.fields) {
      const value = formData[field.key] ?? "";
      if (field.required && !value.trim()) {
        nextFieldErrors[field.key] = `${field.label} là bắt buộc.`;
      } else if (field.maxLength && value.length > field.maxLength) {
        nextFieldErrors[field.key] = `Tối đa ${field.maxLength} ký tự.`;
      } else if (
        field.type === "number" &&
        value.trim() &&
        !Number.isFinite(Number(value))
      ) {
        nextFieldErrors[field.key] = "Vui lòng nhập một số hợp lệ.";
      }
    }
    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    const request = Object.fromEntries(
      definition.fields.map((field) => {
        const value = formData[field.key] ?? "";
        if (field.type === "number") {
          return [field.key, value.trim() ? Number(value) : null];
        }
        return [field.key, value.trim() || null];
      })
    ) as MasterDataRequestMap[MasterDataResource];

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (formMode === "edit" && selectedItem) {
        await updateMasterData(
          resource,
          String(rowValue(selectedItem, definition.idField)),
          request
        );
      } else {
        await createMasterData(resource, request);
      }
      setFormMode(null);
      setSelectedItem(null);
      await loadPage(page);
    } catch (caught) {
      if (caught instanceof MasterDataApiError) {
        setFieldErrors(caught.fieldErrors);
        setFormError(caught.message);
      } else {
        setFormError(
          caught instanceof Error ? caught.message : "Không thể lưu dữ liệu."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = async (item: MasterDataRow) => {
    const id = String(rowValue(item, definition.idField));
    if (!window.confirm(`Xóa "${id} — ${String(rowValue(item, definition.nameField))}"?`)) {
      return;
    }
    setDeletingId(id);
    setError(null);
    try {
      await deleteMasterData(resource, id);
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      await loadPage(nextPage);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Không thể xóa bản ghi."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Quản lý ${definition.label.toLocaleLowerCase()}`}
        description={`Danh sách ${definition.label.toLocaleLowerCase()} theo API, hỗ trợ xem, thêm, sửa và xóa.`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void loadPage(page);
            setRelationsRevision((revision) => revision + 1);
          }}
          disabled={isLoading}
          aria-label="Làm mới"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" onClick={() => openForm("create")}>
          <Plus className="h-4 w-4" />
          Thêm {definition.label.toLocaleLowerCase()}
        </Button>
      </PageHeader>

      {error && (
        <ErrorState
          title="Không thể hoàn tất thao tác"
          message={error}
        />
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
        {isLoading ? (
          <div className="space-y-3 p-6" aria-label="Đang tải dữ liệu">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="h-10 animate-pulse rounded bg-surface-muted"
              />
            ))}
          </div>
        ) : !items.length ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-text-primary">
              Chưa có {definition.label.toLocaleLowerCase()} nào
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Tạo bản ghi đầu tiên để bắt đầu.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{definition.fields.find((field) => field.key === definition.idField)?.label}</TableHead>
                <TableHead>{definition.fields.find((field) => field.key === definition.nameField)?.label}</TableHead>
                <TableHead className="w-36 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const id = String(rowValue(item, definition.idField));
                return (
                  <TableRow key={id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {id}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatValue(rowValue(item, definition.nameField))}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Xem chi tiết"
                          aria-label={`Xem ${id}`}
                          onClick={() => void openDetail(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Chỉnh sửa"
                          aria-label={`Sửa ${id}`}
                          onClick={() => openForm("edit", item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Xóa"
                          aria-label={`Xóa ${id}`}
                          disabled={deletingId === id}
                          onClick={() => void removeItem(item)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between border-t border-border bg-surface-muted/30 px-4 py-3">
            <span className="text-xs text-text-secondary">
              {items.length} / {total} bản ghi
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => void loadPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <span className="text-xs text-text-secondary">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => void loadPage(page + 1)}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={formMode !== null}
        onClose={closeForm}
        title={
          formMode === "view"
            ? `Chi tiết ${definition.label.toLocaleLowerCase()}`
            : formMode === "edit"
              ? `Cập nhật ${definition.label.toLocaleLowerCase()}`
              : `Thêm ${definition.label.toLocaleLowerCase()}`
        }
        maxWidth="2xl"
        footer={
          formMode === "view" ? (
            <Button variant="outline" size="sm" onClick={closeForm}>
              Đóng
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={closeForm}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                form="master-data-form"
                size="sm"
                isLoading={isSubmitting}
              >
                {formMode === "edit" ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </>
          )
        }
      >
        {formMode === "view" && isLoadingDetail ? (
          <div className="space-y-3">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-8 animate-pulse rounded bg-surface-muted"
              />
            ))}
          </div>
        ) : formMode === "view" && selectedItem ? (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {definition.fields.flatMap((field) => [
              <div key={field.key} className="min-w-0">
                <dt className="text-xs font-medium text-text-muted">
                  {field.label}
                </dt>
                <dd className="mt-1 break-words text-sm text-text-primary">
                  {formatValue(rowValue(selectedItem, field.key))}
                </dd>
              </div>,
              ...(field.navigationField
                ? [
                    <div key={field.navigationField} className="min-w-0">
                      <dt className="text-xs font-medium text-text-muted">
                        {field.label} (tên)
                      </dt>
                      <dd className="mt-1 break-words text-sm text-text-primary">
                        {formatValue(
                          rowValue(selectedItem, field.navigationField)
                        )}
                      </dd>
                    </div>,
                  ]
                : []),
            ])}
          </dl>
        ) : (
          <form
            id="master-data-form"
            onSubmit={submitForm}
            className="space-y-4"
            noValidate
          >
            {formError && (
              <div
                role="alert"
                className="flex gap-2 rounded-md border border-danger/20 bg-rose-50 p-3 text-xs text-danger"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {definition.fields.map((field) => {
                const errorMessage = fieldErrors[field.key];
                if (field.relation) {
                  return (
                    <Select
                      key={field.key}
                      label={`${field.label}${field.required ? " *" : ""}`}
                      value={formData[field.key] ?? ""}
                      error={errorMessage}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    >
                      <option value="">-- Không chọn --</option>
                      {(relationOptions[field.relation] ?? []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  );
                }
                if (field.type === "select") {
                  return (
                    <Select
                      key={field.key}
                      label={`${field.label}${field.required ? " *" : ""}`}
                      value={formData[field.key] ?? ""}
                      error={errorMessage}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    >
                      <option value="">-- Chọn loại đối tác --</option>
                      {(field.options ?? []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  );
                }
                if (field.type === "textarea") {
                  return (
                    <label
                      key={field.key}
                      className="space-y-1.5 sm:col-span-2"
                    >
                      <span className="block text-xs font-medium text-text-secondary">
                        {field.label}
                      </span>
                      <textarea
                        rows={3}
                        maxLength={field.maxLength}
                        disabled={isSubmitting}
                        value={formData[field.key] ?? ""}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:bg-surface-muted"
                      />
                      {errorMessage && (
                        <span className="block text-xs text-danger">
                          {errorMessage}
                        </span>
                      )}
                    </label>
                  );
                }
                return (
                  <Input
                    key={field.key}
                    label={`${field.label}${field.required ? " *" : ""}`}
                    type={field.type}
                    step={field.type === "number" ? "any" : undefined}
                    maxLength={field.maxLength}
                    value={formData[field.key] ?? ""}
                    error={errorMessage}
                    disabled={
                      isSubmitting ||
                      (formMode === "edit" && field.key === definition.idField)
                    }
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  />
                );
              })}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
