"use client";

import * as React from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  DocumentDefinition,
  DocumentDetailRow,
  DocumentField,
  DocumentInfoSection,
  DocumentRow,
  RECEIPT_DOCUMENT,
  TRANSFER_DOCUMENT,
} from "@/lib/document-definitions";
import { MASTER_DATA_DEFINITIONS } from "@/lib/master-data-definitions";
import {
  getMasterDataOptions,
  MasterDataApiError,
} from "@/services/masterDataService";
import { MasterDataResource, MasterDataResponseMap } from "@/types/master-data";

type RelationOptions = Record<string, Array<{ value: string; label: string }>>;
type DetailEditorTarget =
  | { kind: "draft-new" }
  | { kind: "draft-edit"; index: number }
  | { kind: "saved-new" }
  | { kind: "saved-edit"; id: number };

const PAGE_SIZE = 20;

function emptyValues(fields: DocumentField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

function validateFields(
  fields: DocumentField[],
  values: Record<string, string>,
  prefix = ""
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = values[field.key] ?? "";
    const key = `${prefix}${field.key}`;
    if (field.required && !value.trim()) {
      errors[key] = `${field.label} là bắt buộc.`;
    } else if (field.maxLength && value.length > field.maxLength) {
      errors[key] = `Tối đa ${field.maxLength} ký tự.`;
    } else if (
      field.type === "number" &&
      value.trim() &&
      !Number.isFinite(Number(value))
    ) {
      errors[key] = "Vui lòng nhập một số hợp lệ.";
    }
  }
  return errors;
}

function display(value: string | null | undefined): string {
  return value || "—";
}

function savedDetailFormValues(
  fields: DocumentField[],
  row: DocumentDetailRow
): Record<string, string> {
  const values = emptyValues(fields);
  for (const field of fields) {
    values[field.key] = row.values[field.key] ?? "";
  }
  return values;
}

export function DocumentManager({
  kind,
}: {
  kind: "receipt" | "transfer";
}) {
  const definition: DocumentDefinition =
    kind === "receipt" ? RECEIPT_DOCUMENT : TRANSFER_DOCUMENT;
  const [rows, setRows] = React.useState<DocumentRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [relationError, setRelationError] = React.useState<string | null>(null);
  const [relationOptions, setRelationOptions] =
    React.useState<RelationOptions>({});
  const [isTransactionOpen, setIsTransactionOpen] = React.useState(false);
  const [headerValues, setHeaderValues] = React.useState<
    Record<string, string>
  >({});
  const [draftDetails, setDraftDetails] = React.useState<
    Array<Record<string, string>>
  >([]);
  const [selectedHeader, setSelectedHeader] =
    React.useState<DocumentRow | null>(null);
  const [savedDetails, setSavedDetails] = React.useState<DocumentDetailRow[]>(
    []
  );
  const [headerInfoSections, setHeaderInfoSections] = React.useState<
    DocumentInfoSection[]
  >([]);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [detailEditorTarget, setDetailEditorTarget] =
    React.useState<DetailEditorTarget | null>(null);
  const [detailEditorValues, setDetailEditorValues] = React.useState<
    Record<string, string>
  >({});
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [detailFormError, setDetailFormError] = React.useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deletingDetailId, setDeletingDetailId] = React.useState<number | null>(
    null
  );
  const detailLoadRequest = React.useRef(0);

  const loadPage = React.useCallback(
    async (requestedPage: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await definition.loadPage(requestedPage, PAGE_SIZE);
        setRows(result.items);
        setTotal(result.total);
        setPage(result.page);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Không thể tải danh sách phiếu."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [definition]
  );

  const loadSavedDetails = React.useCallback(
    async (header: DocumentRow) => {
      const requestId = detailLoadRequest.current + 1;
      detailLoadRequest.current = requestId;
      setIsLoadingDetails(true);
      setDetailError(null);
      try {
        const result = await definition.loadDetails(header.id);
        if (detailLoadRequest.current === requestId) {
          setSavedDetails(result.items);
          setHeaderInfoSections(result.headerSections);
        }
      } catch (caught) {
        if (detailLoadRequest.current === requestId) {
          setDetailError(
            caught instanceof Error
              ? caught.message
              : "Không thể tải chi tiết phiếu."
          );
        }
      } finally {
        if (detailLoadRequest.current === requestId) setIsLoadingDetails(false);
      }
    },
    [definition]
  );

  React.useEffect(() => {
    void loadPage(page);
  }, [loadPage, page]);

  React.useEffect(() => {
    let active = true;
    const relations = Array.from(
      new Set(
        [...definition.headerFields, ...definition.detailFields]
          .map((field) => field.relation)
          .filter((relation): relation is MasterDataResource => !!relation)
      )
    );
    Promise.all(
      relations.map(async (resource) => {
        const items: MasterDataResponseMap[MasterDataResource][] =
          await getMasterDataOptions(resource);
        const relatedDefinition = MASTER_DATA_DEFINITIONS[resource];
        return [
          resource,
          items.map((item) => {
            const id = Reflect.get(item, relatedDefinition.idField);
            const name = Reflect.get(item, relatedDefinition.nameField);
            return {
              value: String(id ?? ""),
              label: `${String(id ?? "")} — ${String(name ?? "")}`,
            };
          }),
        ] as const;
      })
    )
      .then((entries) => {
        if (active) setRelationOptions(Object.fromEntries(entries));
      })
      .catch((caught: unknown) => {
        if (active) {
          setRelationError(
            caught instanceof Error
              ? caught.message
              : "Không thể tải dữ liệu tham chiếu."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [definition]);

  const openTransaction = () => {
    setHeaderValues(emptyValues(definition.headerFields));
    setDraftDetails([]);
    setSelectedHeader(null);
    setSavedDetails([]);
    setHeaderInfoSections([]);
    setFieldErrors({});
    setFormError(null);
    setIsTransactionOpen(true);
  };

  const closeTransaction = () => {
    if (isSubmitting) return;
    setIsTransactionOpen(false);
    setFormError(null);
    setFieldErrors({});
  };

  const selectHeader = (row: DocumentRow) => {
    if (selectedHeader?.id === row.id) {
      detailLoadRequest.current += 1;
      setSelectedHeader(null);
      setSavedDetails([]);
      setHeaderInfoSections([]);
      setDetailError(null);
      setIsLoadingDetails(false);
      return;
    }
    setSelectedHeader(row);
    setSavedDetails([]);
    void loadSavedDetails(row);
  };

  const closeDetails = () => {
    detailLoadRequest.current += 1;
    setSelectedHeader(null);
    setSavedDetails([]);
    setDetailError(null);
    setIsLoadingDetails(false);
  };

  const openDraftDetailEditor = (index?: number) => {
    setDetailFormError(null);
    setFieldErrors({});
    if (index === undefined) {
      setDetailEditorTarget({ kind: "draft-new" });
      setDetailEditorValues(emptyValues(definition.detailFields));
    } else {
      setDetailEditorTarget({ kind: "draft-edit", index });
      setDetailEditorValues({ ...draftDetails[index] });
    }
  };

  const openSavedDetailEditor = (row?: DocumentDetailRow) => {
    setDetailFormError(null);
    setFieldErrors({});
    if (row) {
      setDetailEditorTarget({ kind: "saved-edit", id: row.id });
      setDetailEditorValues(savedDetailFormValues(definition.detailFields, row));
    } else {
      setDetailEditorTarget({ kind: "saved-new" });
      setDetailEditorValues(emptyValues(definition.detailFields));
    }
  };

  const closeDetailEditor = () => {
    if (isSubmitting) return;
    setDetailEditorTarget(null);
    setDetailFormError(null);
    setFieldErrors({});
  };

  const submitTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateFields(definition.headerFields, headerValues);
    draftDetails.forEach((detail, index) => {
      Object.assign(
        nextErrors,
        validateFields(definition.detailFields, detail, `detail.${index}.`)
      );
    });
    if (draftDetails.length === 0) {
      setFormError("Thêm ít nhất một dòng vật tư trước khi tạo phiếu.");
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);
    try {
      await definition.createTransaction(headerValues, draftDetails);
      const newPage = Math.floor(total / PAGE_SIZE) + 1;
      setIsTransactionOpen(false);
      setSelectedHeader(null);
      await loadPage(newPage);
    } catch (caught) {
      if (caught instanceof MasterDataApiError) {
        setFieldErrors(caught.fieldErrors);
        setFormError(caught.message);
      } else {
        setFormError(
          caught instanceof Error ? caught.message : "Không thể tạo phiếu."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDetailEditor = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const nextErrors = validateFields(
      definition.detailFields,
      detailEditorValues
    );
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setDetailFormError(null);
      return;
    }
    setFieldErrors({});
    setDetailFormError(null);

    const target = detailEditorTarget;
    if (!target) return;
    setIsSubmitting(true);
    try {
      if (target.kind === "draft-new") {
        setDraftDetails((current) => [...current, detailEditorValues]);
      } else if (target.kind === "draft-edit") {
        setDraftDetails((current) =>
          current.map((detail, index) =>
            index === target.index ? detailEditorValues : detail
          )
        );
      } else if (selectedHeader && target.kind === "saved-new") {
        await definition.createDetail(selectedHeader.id, detailEditorValues);
        await loadSavedDetails(selectedHeader);
      } else if (selectedHeader && target.kind === "saved-edit") {
        await definition.updateDetail(
          selectedHeader.id,
          target.id,
          detailEditorValues
        );
        await loadSavedDetails(selectedHeader);
      }
      setDetailEditorTarget(null);
    } catch (caught) {
      if (caught instanceof MasterDataApiError) {
        setFieldErrors(caught.fieldErrors);
        setDetailFormError(caught.message);
      } else {
        setDetailFormError(
          caught instanceof Error
            ? caught.message
            : "Không thể lưu dòng chi tiết."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeDraftDetail = (index: number) => {
    setDraftDetails((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const removeSavedDetail = async (row: DocumentDetailRow) => {
    if (
      !window.confirm(
        `Xóa dòng vật tư "${row.code}" (ID ${row.id}) khỏi phiếu ${selectedHeader?.id ?? ""}?`
      )
    ) {
      return;
    }
    setDeletingDetailId(row.id);
    setDetailError(null);
    try {
      await definition.deleteDetail(row.id);
      if (selectedHeader) await loadSavedDetails(selectedHeader);
    } catch (caught) {
      setDetailError(
        caught instanceof Error
          ? caught.message
          : "Không thể xóa dòng chi tiết."
      );
    } finally {
      setDeletingDetailId(null);
    }
  };

  const renderField = (
    field: DocumentField,
    values: Record<string, string>,
    onChange: (key: string, value: string) => void,
    errorKey = field.key
  ) => {
    const value = values[field.key] ?? "";
    const errorMessage = fieldErrors[errorKey];
    if (field.relation) {
      return (
        <Select
          key={errorKey}
          label={`${field.label}${field.required ? " *" : ""}`}
          value={value}
          error={errorMessage}
          disabled={isSubmitting}
          onChange={(event) => onChange(field.key, event.target.value)}
        >
          <option value="">-- Chọn {field.label.toLocaleLowerCase()} --</option>
          {(relationOptions[field.relation] ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    }
    if (field.type === "textarea") {
      return (
        <label key={errorKey} className="space-y-1.5 sm:col-span-2">
          <span className="block text-xs font-medium text-text-secondary">
            {field.label}
          </span>
          <textarea
            rows={2}
            maxLength={field.maxLength}
            disabled={isSubmitting}
            value={value}
            onChange={(event) => onChange(field.key, event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:bg-surface-muted"
          />
          {errorMessage && (
            <span className="block text-xs text-danger">{errorMessage}</span>
          )}
        </label>
      );
    }
    return (
      <Input
        key={errorKey}
        label={`${field.label}${field.required ? " *" : ""}`}
        type={field.type}
        step={field.type === "number" ? "any" : undefined}
        maxLength={field.maxLength}
        value={value}
        error={errorMessage}
        disabled={isSubmitting}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    );
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Quản lý ${definition.title.toLocaleLowerCase()}`}
        description={definition.description}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadPage(page)}
          disabled={isLoading}
          aria-label="Làm mới"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
        {isTransactionOpen ? (
          <Button
            variant="outline"
            size="sm"
            onClick={closeTransaction}
            disabled={isSubmitting}
          >
            Hủy phiếu mới
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={openTransaction}
            disabled={detailEditorTarget !== null}
          >
            <Plus className="h-4 w-4" />
            Tạo phiếu
          </Button>
        )}
      </PageHeader>

      {relationError && (
        <div
          role="alert"
          className="flex gap-2 rounded-md border border-danger/20 bg-rose-50 p-3 text-xs text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          Không thể tải mã tham chiếu: {relationError}
        </div>
      )}

      {isTransactionOpen && (
        <section className="space-y-5 rounded-lg border border-border bg-surface p-5 shadow-xs">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Tạo {definition.title.toLocaleLowerCase()}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Header và các dòng vật tư sẽ được tạo cùng lúc.
            </p>
          </div>
          {formError && (
            <div
              role="alert"
              className="flex gap-2 rounded-md border border-danger/20 bg-rose-50 p-3 text-xs text-danger"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}
          <form
            id="document-form"
            onSubmit={submitTransaction}
            noValidate
            className="space-y-5"
          >
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Thông tin header
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {definition.headerFields.map((field) =>
                  renderField(field, headerValues, (key, value) =>
                    setHeaderValues((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  )
                )}
              </div>
            </section>

            <section className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Chi tiết vật tư
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    {draftDetails.length} dòng
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openDraftDetailEditor()}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  Thêm vật tư
                </Button>
              </div>
              <div className="overflow-hidden rounded-md border border-border">
                {draftDetails.length === 0 ? (
                  <p className="p-6 text-center text-xs text-text-secondary">
                    Chưa có dòng vật tư. Chọn “Thêm vật tư” để nhập chi tiết.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {definition.detailColumns.map((column) => (
                          <TableHead key={column.key}>{column.label}</TableHead>
                        ))}
                        <TableHead className="w-24 text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draftDetails.map((detail, index) => (
                        <TableRow key={index}>
                          {definition.detailColumns.map((column) => (
                            <TableCell
                              key={column.key}
                              className={
                                column.key === "maHang" || column.key === "maVatTu"
                                  ? "font-mono text-xs font-semibold text-primary"
                                  : "text-xs"
                              }
                            >
                              {display(detail[column.key])}
                            </TableCell>
                          ))}
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={`Sửa dòng ${index + 1}`}
                                onClick={() => openDraftDetailEditor(index)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={`Xóa dòng ${index + 1}`}
                                onClick={() => removeDraftDetail(index)}
                              >
                                <Trash2 className="h-4 w-4 text-danger" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={closeTransaction}
                >
                  Hủy
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Tạo phiếu
                </Button>
              </div>
            </section>
          </form>
        </section>
      )}

      {error && (
        <div
          role="alert"
          className="flex gap-2 rounded-md border border-danger/20 bg-rose-50 p-3 text-xs text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
        {isLoading ? (
          <div className="space-y-3 p-6" aria-label="Đang tải dữ liệu">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-10 animate-pulse rounded bg-surface-muted"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-text-primary">
              Chưa có {definition.title.toLocaleLowerCase()} nào
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Tạo phiếu đầu tiên để bắt đầu.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{definition.idLabel}</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Thông tin</TableHead>
                <TableHead className="w-36 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {row.id}
                  </TableCell>
                  <TableCell>{display(row.date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {row.facts.map((fact) => (
                        <span
                          key={fact.label}
                          className="text-xs text-text-secondary"
                        >
                          <span className="font-medium text-text-primary">
                            {fact.label}:
                          </span>{" "}
                          {display(fact.value)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant={
                          selectedHeader?.id === row.id ? "secondary" : "outline"
                        }
                        size="sm"
                        onClick={() => selectHeader(row)}
                        disabled={isTransactionOpen || detailEditorTarget !== null}
                      >
                        {selectedHeader?.id === row.id ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <PlusCircle className="h-4 w-4" />
                        )}
                        {selectedHeader?.id === row.id
                          ? "Đóng chi tiết"
                          : "Chi tiết"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between border-t border-border bg-surface-muted/30 px-4 py-3">
            <span className="text-xs text-text-secondary">
              {rows.length} / {total} phiếu
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
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
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={
          selectedHeader !== null &&
          detailEditorTarget === null &&
          !isTransactionOpen
        }
        onClose={closeDetails}
        title={`Chi tiết ${definition.title.toLocaleLowerCase()} — ${selectedHeader?.id ?? ""}`}
        description={
          isLoadingDetails
            ? "Đang tải thông tin phiếu..."
            : `${savedDetails.length} dòng vật tư`
        }
        maxWidth="2xl"
        className="max-w-6xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeDetails}>
              Đóng
            </Button>
            <Button
              size="sm"
              onClick={() => openSavedDetailEditor()}
              disabled={isLoadingDetails || selectedHeader === null}
            >
              <Plus className="h-4 w-4" />
              Thêm vật tư
            </Button>
          </>
        }
      >
        {detailError && (
          <div
            role="alert"
            className="mb-4 flex gap-2 rounded-md border border-danger/20 bg-rose-50 p-3 text-xs text-danger"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {detailError}
          </div>
        )}
        {!isLoadingDetails && headerInfoSections.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {headerInfoSections.map((section) => (
              <section
                key={section.title}
                className="rounded-md border border-border p-3"
              >
                <h3 className="mb-3 text-xs font-semibold text-text-primary">
                  {section.title}
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.label} className="min-w-0">
                      <dt className="text-[11px] font-medium text-text-muted">
                        {field.label}
                      </dt>
                      <dd className="mt-0.5 break-words text-xs text-text-primary">
                        {display(field.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
        <div className="overflow-hidden rounded-md border border-border">
          {isLoadingDetails ? (
            <div className="space-y-3 p-5" aria-label="Đang tải chi tiết phiếu">
              <div className="h-8 animate-pulse rounded bg-surface-muted" />
              <div className="h-8 animate-pulse rounded bg-surface-muted" />
            </div>
          ) : savedDetails.length === 0 ? (
            <p className="p-6 text-center text-xs text-text-secondary">
              Phiếu chưa có dòng vật tư.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {definition.detailColumns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                  <TableHead className="w-24 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedDetails.map((detail) => (
                  <TableRow key={detail.id}>
                    {definition.detailColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={
                          column.key === "maHang" || column.key === "maVatTu"
                            ? "font-mono text-xs font-semibold text-primary"
                            : "text-xs"
                        }
                      >
                        {display(detail.values[column.key])}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Sửa dòng ${detail.id}`}
                          disabled={deletingDetailId === detail.id}
                          onClick={() => openSavedDetailEditor(detail)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Xóa dòng ${detail.id}`}
                          disabled={deletingDetailId === detail.id}
                          onClick={() => void removeSavedDetail(detail)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={detailEditorTarget !== null}
        onClose={closeDetailEditor}
        title={
          detailEditorTarget?.kind === "draft-edit" ||
          detailEditorTarget?.kind === "saved-edit"
            ? "Sửa dòng vật tư"
            : "Thêm dòng vật tư"
        }
        description={
          detailEditorTarget?.kind === "saved-new" ||
          detailEditorTarget?.kind === "saved-edit"
            ? `${definition.idLabel}: ${selectedHeader?.id ?? ""}`
            : "Nhập thông tin chi tiết vật tư."
        }
        maxWidth="2xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={closeDetailEditor}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="detail-editor-form"
              size="sm"
              isLoading={isSubmitting}
            >
              {detailEditorTarget?.kind === "draft-edit" ||
              detailEditorTarget?.kind === "saved-edit"
                ? "Lưu thay đổi"
                : "Thêm dòng"}
            </Button>
          </>
        }
      >
        {detailFormError && (
          <div
            role="alert"
            className="mb-4 flex gap-2 rounded-md border border-danger/20 bg-rose-50 p-3 text-xs text-danger"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {detailFormError}
          </div>
        )}
        <form
          id="detail-editor-form"
          onSubmit={submitDetailEditor}
          noValidate
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {definition.detailFields.map((field) =>
            renderField(field, detailEditorValues, (key, value) =>
              setDetailEditorValues((current) => ({
                ...current,
                [key]: value,
              }))
            )
          )}
        </form>
      </Modal>
    </div>
  );
}
