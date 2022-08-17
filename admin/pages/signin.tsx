/** @jsxRuntime classic */
/** @jsx jsx */

import {
  useState,
  useMemo,
  ReactNode,
  Fragment,
  FormEvent,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "@keystone-6/core/admin-ui/router";
import {
  jsx,
  Box,
  Stack,
  VisuallyHidden,
  Center,
  useTheme,
} from "@keystone-ui/core";
import { Button } from "@keystone-ui/button";
import { TextInput } from "@keystone-ui/fields";
import { Notice } from "@keystone-ui/notice";
import { useMutation, gql } from "@keystone-6/core/admin-ui/apollo";
import {
  useRawKeystone,
  useReinitContext,
} from "@keystone-6/core/admin-ui/context";
import { LoadingDots } from "@keystone-ui/loading";

type SigninContainerProps = {
  children: ReactNode;
  title?: string;
};

const SEED_USERNAME = "bruce@email.com";
const SEED_PASSWORD = "passw0rd";

function SigninContainer({ children, title }: SigninContainerProps) {
  const { colors, shadow } = useTheme();
  return (
    <div>
      <head>
        <title>{title || "Keystone"}</title>
      </head>
      <Center
        css={{
          minWidth: "100vw",
          minHeight: "100vh",
          backgroundColor: colors.backgroundMuted,
        }}
        rounding="medium"
      >
        <Box
          css={{
            background: colors.background,
            width: 600,
            boxShadow: shadow.s100,
          }}
          margin="medium"
          padding="xlarge"
          rounding="medium"
        >
          {children}
        </Box>
      </Center>
    </div>
  );
}

export const useRedirect = () => {
  const router = useRouter();
  const redirect = useMemo(
    () =>
      !Array.isArray(router.query.from) && router.query.from?.startsWith("/")
        ? router.query.from
        : "/",
    [router]
  );

  return redirect;
};

function Intro() {
  const { typography, spacing } = useTheme();
  return (
    <Stack gap="large">
      <div
        css={{
          fontSize: typography.fontSize.medium,
          color: "#47546b",
          marginBottom: spacing.large,
        }}
      >
        You can login with{" "}
        <strong css={{ fontWeight: typography.fontWeight.bold }}>
          {SEED_USERNAME}
        </strong>{" "}
        as username and{" "}
        <strong css={{ fontWeight: typography.fontWeight.bold }}>
          {SEED_PASSWORD}
        </strong>{" "}
        as password.
      </div>
    </Stack>
  );
}

function SigninForm() {
  const mutation = gql`
    mutation ($email: String!, $password: String!) {
      authenticate: authenticateUserWithPassword(
        email: $email
        password: $password
      ) {
        ... on UserAuthenticationWithPasswordSuccess {
          item {
            id
          }
        }
        ... on UserAuthenticationWithPasswordFailure {
          message
        }
      }
    }
  `;

  const [state, setState] = useState({
    email: SEED_USERNAME,
    password: SEED_PASSWORD,
  });

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const [mutate, { error, loading, data }] = useMutation(mutation);
  const reinitContext = useReinitContext();
  const router = useRouter();
  const redirect = useRedirect();

  return (
    <Stack
      gap="xlarge"
      as="form"
      onSubmit={async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
          let result = await mutate({
            variables: {
              email: state.email,
              password: state.password,
            },
          });
          if (
            result.data.authenticate?.__typename !==
            "UserAuthenticationWithPasswordSuccess"
          ) {
            return;
          }
        } catch (err) {
          return;
        }
        reinitContext();
        router.push(redirect);
      }}
    >
      {error && (
        <Notice title="Error" tone="negative">
          {error.message}
        </Notice>
      )}
      {data?.authenticate?.__typename ===
        "UserAuthenticationWithPasswordFailure" && (
        <Notice title="Error" tone="negative">
          {data?.authenticate.message}
        </Notice>
      )}
      <Stack gap="medium">
        <VisuallyHidden as="label" htmlFor="email">
          email
        </VisuallyHidden>
        <TextInput
          id="email"
          name="email"
          value={state.email}
          onChange={(e) => setState({ ...state, email: e.target.value })}
          placeholder={"email"}
          ref={emailRef}
        />
        <Fragment>
          <VisuallyHidden as="label" htmlFor="password">
            password
          </VisuallyHidden>
          <TextInput
            id="password"
            name="password"
            value={state.password}
            onChange={(e) => setState({ ...state, password: e.target.value })}
            placeholder={"password"}
            type="password"
          />
        </Fragment>
      </Stack>

      <Stack gap="medium" across>
        <Button
          weight="bold"
          tone="active"
          isLoading={
            loading ||
            // this is for while the page is loading but the mutation has finished successfully
            data?.authenticate?.__typename ===
              "UserAuthenticationWithPasswordSuccess"
          }
          type="submit"
        >
          Sign In
        </Button>
      </Stack>
    </Stack>
  );
}

export default function SigninPage() {
  const router = useRouter();
  const rawKeystone = useRawKeystone();
  const redirect = useRedirect();

  // This useEffect specifically handles ending up on the signin page from a SPA navigation
  useEffect(() => {
    if (rawKeystone.authenticatedItem.state === "authenticated") {
      router.push(redirect);
    }
  }, [rawKeystone.authenticatedItem, router, redirect]);

  if (rawKeystone.authenticatedItem.state === "authenticated") {
    return (
      <Center fillView>
        <LoadingDots label="Loading page" size="large" />
      </Center>
    );
  }

  return (
    <SigninContainer title="Keystone - Sign In">
      <Intro />
      <SigninForm />
    </SigninContainer>
  );
}
