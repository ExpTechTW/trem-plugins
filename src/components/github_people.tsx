import { Avatar, AvatarImage } from './ui/avatar';
import Link from 'next/link';

interface Props {
  people: string[];
}

export default function GithubPeople({ people }: Props) {
  const sliced = people.slice(0, 3);
  const images: JSX.Element[] = [];
  const names: JSX.Element[] = [];

  for (let i = 0, n = sliced.length; i < n; i++) {
    const name = sliced[i];
    images.push(
      <Link href={`https://github.com/${name}`}>
        <Avatar
          className="-ml-4 size-6 border-2 border-background"
        >
          <AvatarImage
            src={`https://github.com/${name}.png`}
            alt={`${name} avatar`}
          />
        </Avatar>
      </Link>,
    );

    names.push(<Link href={`https://github.com/${name}`}>{name}</Link>);

    if (people.length > 1) {
      if (i < (n - 2)) {
        names.push(<span>, </span>);
      }

      if (i == (n - 2)) {
        if (people.length <= 3) {
          names.push(<span> 和 </span>);
        }
        else {
          names.push(<span>, </span>);
        }
      }

      if (i == (n - 1)) {
        if (people.length > n) {
          names.push(
            <span>
              ,  還有
              {people.length - n}
              {' '}
              人
            </span>,
          );
        }
      }
    }
  }

  return (

    <div className="flex gap-2 items-center">
      <span className="flex pl-4">{...images}</span>
      <span>{...names}</span>
    </div>
  );
}
