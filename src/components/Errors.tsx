import React, { useState } from "react";
import styled from "styled-components";

import { colors } from "../styles";
import { errorStore } from "../stores";

import { Icon } from "./Icon";
import { Overlay } from "./Molecules";

const ErrorsContainer = styled(Overlay).withConfig({
  shouldForwardProp: () => true,
})`
  border: solid 10px ${colors.red};
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
    & path {
      fill: ${colors.red};
    }
  }
`;

export const Errors: React.FC = () => {
  const [{ errors, notify }, setErrors] = errorStore.useStore();
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
        <ErrorsContainer closeOnPress close={() => toggleError(false)}>
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
