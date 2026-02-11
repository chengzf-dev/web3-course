import * as react_jsx_runtime from 'react/jsx-runtime';
import { Abi } from 'viem';

type BuyButtonProps = {
    courseId: string;
    price: bigint;
    owned: boolean;
    ydTokenAddress: `0x${string}`;
    coursesAddress: `0x${string}`;
    ydTokenAbi: Abi;
    coursesAbi: Abi;
    chainId: number;
    onchainExists: boolean;
};
declare function BuyButton({ courseId, price, owned, ydTokenAddress, coursesAddress, ydTokenAbi, coursesAbi, chainId, onchainExists }: BuyButtonProps): react_jsx_runtime.JSX.Element;

type Course = {
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    onchainExists?: boolean;
    status?: string;
    owned: boolean;
    progress: number;
};
type CourseDetail = Course & {
    content: string | null;
};
type AuthorCourse = {
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    onchainExists?: boolean;
    status?: string;
};

declare function CourseCard({ course, decimals, viewerAddress }: {
    course: Course;
    decimals: number;
    viewerAddress?: `0x${string}`;
}): react_jsx_runtime.JSX.Element;

declare function CourseGrid({ courses }: {
    courses: Course[];
}): react_jsx_runtime.JSX.Element;

type PublishCourseButtonProps = {
    courseId: string;
    priceYd: string;
    authorAddress: string;
    decimals: number;
    onPublished?: () => void;
};
declare function PublishCourseButton({ courseId, priceYd, authorAddress, decimals, onPublished }: PublishCourseButtonProps): react_jsx_runtime.JSX.Element;

type Role = "STUDENT" | "AUTHOR" | "ADMIN";
declare function RoleGate({ roles, children }: {
    roles: Role[];
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function SiteHeader(): react_jsx_runtime.JSX.Element;

declare function SwapForm(): react_jsx_runtime.JSX.Element;

type TxStep = "idle" | "approving" | "approved" | "buying" | "success" | "error";
declare function TxStatus({ step, kind }: {
    step: TxStep;
    kind?: "purchase" | "swap";
}): react_jsx_runtime.JSX.Element;

declare function WagmiAppProvider({ children }: {
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function WalletConnect({ showAddress }: {
    showAddress?: boolean;
}): react_jsx_runtime.JSX.Element;

export { type AuthorCourse, BuyButton, type Course, CourseCard, type CourseDetail, CourseGrid, PublishCourseButton, RoleGate, SiteHeader, SwapForm, TxStatus, WagmiAppProvider as WagmiProvider, WalletConnect };
