import React, { useState } from "react";
import styled from "styled-components";

import { colors } from "../styles";
import { useErrorsStore } from "../hooks";
import { setErrors } from "../stores";

import { Icon } from "./Icon";

const ErrorsContainer = styled.div`
  position: fixed;
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: solid 10px ${colors.red};
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
`;

const ErrorsContent = styled.div`
  max-height: calc(100% - 40px);
  overflow: auto;
`;

const ErrorBox = styled.div`
  background: ${colors.red};
  padding: 20px;
  margin: auto;
  margin-bottom: 20px;
  width: max-content;
`;

const ErrorIndicator = styled.a<{ newError?: boolean }>`
  position: fixed;
  left: 0;
  bottom: 0;
  padding: 0 0 10px 15px;
  opacity: ${({ newError }) => (newError ? 1 : 0)};

  & > svg {
    width: 50px;
    height: 50px;

    & path {
      fill: ${colors.red};
    }
  }
`;

export const Errors: React.FC = () => {
  const [{ errors, notify }] = useErrorsStore();
  const [showErrors, setShowErrors] = useState(false);

  const toggleError = (showErrors: boolean) => {
    setShowErrors(showErrors);
    if (showErrors) setErrors((s) => ({ ...s, notify: false }));
  };

  return (
    <>
      <ErrorIndicator newError={notify} onClick={() => toggleError(true)}>
        <Icon Warning />
      </ErrorIndicator>
      {showErrors && (
        <ErrorsContainer onClick={() => toggleError(false)}>
          <ErrorsContent>
            {errors.map((err) => (
              <ErrorBox key={err.id} onClick={(e) => e.stopPropagation()}>
                {err.code ? `(${err.code}) ` : ""}
                {err.name}: {err.message} [by {err.service} at {err.time}]
              </ErrorBox>
            ))}
          </ErrorsContent>
        </ErrorsContainer>
      )}
    </>
  );
};
