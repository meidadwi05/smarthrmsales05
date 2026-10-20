import React from "react";
import { ChevronDown, UserRound } from "lucide-react";

const COLORS = {
  header: "#2C70A9",
  white: "#FFFFFF",
  text: "#334155",
  label: "#475569",
  border: "#D7E1ED",
  required: "#E11D48",
  helper: "#64748B",
  uploadBlue: "#2F6FE4"
};

const inputStyle = {
  display: "block",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  height: "42px",
  minHeight: "42px",
  boxSizing: "border-box",
  border: `1px solid ${COLORS.border}`,
  borderRadius: "8px",
  padding: "0 13px",
  fontSize: "12px",
  fontWeight: 400,
  color: COLORS.text,
  background: COLORS.white,
  backgroundColor: COLORS.white,
  backgroundImage: "none",
  boxShadow: "none",
  outline: "none"
};

const labelStyle = {
  display: "inline-flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "4px",
  width: "fit-content",
  maxWidth: "100%",
  margin: 0,
  fontSize: "12px",
  lineHeight: "18px",
  fontWeight: 600,
  color: COLORS.label
};

const helperStyle = {
  fontSize: "11px",
  lineHeight: "16px",
  color: "#111827",
  fontStyle: "italic",
  marginTop: "-2px"
};

export function Section({ title, icon: Icon, children }) {
  return (
    <section
      className="employee-section-card"
      style={{
        width: "auto",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        background: COLORS.white,
        backgroundImage: "none",
        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        margin: "18px 20px",
        boxShadow: "0 3px 12px rgba(15, 23, 42, 0.05)"
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "10px",
          width: "100%",
          minHeight: "52px",
          boxSizing: "border-box",
          padding: "14px 18px",
          background: COLORS.header,
          backgroundColor: COLORS.header,
          backgroundImage: "none",
          color: COLORS.white
        }}
      >
        {Icon && (
          <Icon
            size={18}
            strokeWidth={2}
            style={{
              flexShrink: 0,
              color: COLORS.white
            }}
          />
        )}

        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: "20px",
            color: COLORS.white
          }}
        >
          {title}
        </span>
      </header>

      <div
        className="employee-section-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          columnGap: "22px",
          rowGap: "18px",
          alignItems: "start",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          padding: "18px 18px 24px",
          background: COLORS.white,
          backgroundColor: COLORS.white,
          backgroundImage: "none"
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function Field({
  label,
  name,
  form,
  setForm,
  type = "text",
  options,
  required = false,
  placeholder = "",
  full = false,
  disabled = false,
  textarea = false,
  rows = 3,
  helperText = "",
  value: customValue,
  onChange: customOnChange,
  inputMode
}) {
  const value = customValue !== undefined ? customValue : (form?.[name] ?? "");

  const handleChange = (e) => {
    if (customOnChange) {
      customOnChange(e);
      return;
    }
    setForm?.((previous) => ({
      ...previous,
      [name]: e.target.value
    }));
  };

  return (
    <div
      className="employee-form-field"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "7px",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        gridColumn: full ? "1 / -1" : undefined,
        background: COLORS.white,
        backgroundImage: "none"
      }}
    >
      <label htmlFor={`employee-${name}`} style={labelStyle}>
        <span>{label}</span>
        {required && (
          <span
            aria-hidden="true"
            style={{
              display: "inline",
              color: COLORS.required,
              fontSize: "12px",
              fontWeight: 700,
              lineHeight: "18px"
            }}
          >
            *
          </span>
        )}
      </label>

      {options ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0
          }}
        >
          <select
            id={`employee-${name}`}
            name={name}
            required={required}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            style={{
              ...inputStyle,
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              paddingRight: "46px",
              cursor: disabled ? "not-allowed" : "pointer"
            }}
          >
            <option value="">-- Pilih {label} --</option>

            {options.map((option) => {
              const optionValue =
                typeof option === "string" ? option : option.value;

              const optionLabel =
                typeof option === "string" ? option : option.label;

              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>

          <ChevronDown
            size={17}
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              color: COLORS.label,
              pointerEvents: "none"
            }}
          />
        </div>
      ) : textarea ? (
        <textarea
          id={`employee-${name}`}
          name={name}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          rows={rows}
          onChange={handleChange}
          style={{
            ...inputStyle,
            height: "auto",
            minHeight: rows >= 4 ? "96px" : "72px",
            padding: "10px 13px",
            resize: "vertical"
          }}
        />
      ) : (
        <input
          id={`employee-${name}`}
          name={name}
          type={type}
          inputMode={inputMode}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          style={inputStyle}
        />
      )}

      {helperText ? (
        <span style={helperStyle}>{helperText}</span>
      ) : null}
    </div>
  );
}

export function UploadField({
  label,
  name,
  files = {},
  setFiles,
  required = false,
  full = false,
  accept
}) {
  return (
    <div
      className="employee-form-field"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "7px",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        gridColumn: full ? "1 / -1" : undefined,
        background: COLORS.white,
        backgroundImage: "none"
      }}
    >
      <label htmlFor={`employee-file-${name}`} style={labelStyle}>
        <span>{label}</span>
        {required && (
          <span
            aria-hidden="true"
            style={{
              color: COLORS.required,
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            *
          </span>
        )}
      </label>

      <input
        id={`employee-file-${name}`}
        name={name}
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;

          setFiles((previous) => ({
            ...previous,
            [name]: selectedFile
          }));
        }}
        style={{
          ...inputStyle,
          height: "42px",
          padding: "8px 12px",
          fontSize: "11px",
          cursor: "pointer"
        }}
      />

      {files?.[name] && (
        <span
          style={{
            fontSize: "11px",
            color: COLORS.label,
            fontWeight: 400,
            overflowWrap: "anywhere"
          }}
        >
          {files[name].name}
        </span>
      )}
    </div>
  );
}



export function ProfileUploadField({
  label,
  name,
  files = {},
  setFiles,
  required = false
}) {
  const selectedFile = files?.[name] || null;
  const fileName =
    selectedFile?.name || "Tidak ada file yang dipilih";

  const inputRef = React.useRef(null);
  const [preview, setPreview] = React.useState(null);

  React.useEffect(() => {
    if (!selectedFile || !selectedFile.type?.startsWith("image/")) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  return (
    <div
      className="employee-form-field"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        minWidth: 0,
        padding: 0,
        margin: 0,
        boxSizing: "border-box",
        background: "#FFFFFF"
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          flex: "0 0 80px",
          borderRadius: "50%",
          border: "1px solid #D7E1ED",
          background: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview foto profil"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <UserRound size={38} color="#9CA3AF" />
        )}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "7px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "18px",
            fontSize: "12px",
            fontWeight: 600,
            color: COLORS.label
          }}
        >
          <span>{label}</span>
          {required && (
            <span style={{ color: COLORS.required }}>*</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            height: "42px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            overflow: "hidden",
            background: "#FFFFFF",
            boxSizing: "border-box"
          }}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 116px",
              height: "100%",
              padding: 0,
              margin: 0,
              border: "none",
              borderRadius: 0,
              background: "#2F6FE4",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Pilih File
          </button>

          <div
            title={fileName}
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
              padding: "0 12px",
              fontSize: "12px",
              color: "#64748B",
              background: "#FFFFFF",
              overflow: "hidden"
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {fileName}
            </span>
          </div>
        </div>

        <input
          ref={inputRef}
          id={`employee-photo-${name}`}
          name={name}
          type="file"
          accept="image/*"
          required={required}
          aria-label={label}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setFiles((previous) => ({
              ...previous,
              [name]: file
            }));
          }}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
            clipPath: "inset(50%)"
          }}
        />
      </div>
    </div>
  );
}
